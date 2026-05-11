import { useEffect, useMemo, useState } from "react";
import api from "../api/client.js";
import sampleProducts from "../data/sampleProducts.js";

const filterSamples = ({ category = "All", search = "", featured = false } = {}) => {
  const term = search.trim().toLowerCase();

  return sampleProducts.filter((product) => {
    const matchesCategory = category === "All" || !category || product.category === category;
    const matchesSearch =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term);
    const matchesFeatured = !featured || product.isFeatured;
    return matchesCategory && matchesSearch && matchesFeatured;
  });
};

export const useProducts = ({ category = "All", search = "", featured = false } = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => ({ category, search, featured }), [category, search, featured]);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/products", {
          params: {
            category: params.category !== "All" ? params.category : undefined,
            search: params.search || undefined,
            featured: params.featured ? "true" : undefined
          },
          signal: controller.signal
        });
        const productList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.products)
            ? response.data.products
            : [];

        if (!productList.length && response.data && !Array.isArray(response.data)) {
          throw new Error("Products API did not return a product list");
        }

        setProducts(productList);
      } catch (requestError) {
        if (requestError.name === "CanceledError") return;
        setProducts(filterSamples(params));
        setError("Showing sample products until the backend is connected.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    return () => controller.abort();
  }, [params]);

  return { products, loading, error };
};

export const findSampleProduct = (id) => sampleProducts.find((product) => product._id === id);
