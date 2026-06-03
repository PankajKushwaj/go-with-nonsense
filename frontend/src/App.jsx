import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import About from "./pages/About.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Contact from "./pages/Contact.jsx";
import CustomerAccount from "./pages/CustomerAccount.jsx";
import CustomerLogin from "./pages/CustomerLogin.jsx";
import CustomOrder from "./pages/CustomOrder.jsx";
import Home from "./pages/Home.jsx";
import Jewellery from "./pages/Jewellery.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Shop from "./pages/Shop.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";

const App = () => (
  <div className="min-h-screen bg-cream text-ink">
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/jewellery" element={<Jewellery />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/custom-order" element={<CustomOrder />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route
          path="/account"
          element={
            <CustomerProtectedRoute>
              <CustomerAccount />
            </CustomerProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
