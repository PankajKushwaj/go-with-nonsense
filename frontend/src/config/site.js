export const brand = {
  name: "Go with Nonsense",
  tagline: "Handmade Resin Art & Creative Crafts",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999",
  instagramUrl: import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/gowithnonsense",
  email: "pankajkushwah768992@gmail.com"
};

export const categories = [
  "Resin Keychains",
  "Resin Frames",
  "Resin Clocks",
  "Wall Art",
  "Jewellery",
  "Bookmarks",
  "Custom Gifts",
  "Handmade Crafts"
];

export const orderStatuses = ["Pending", "Confirmed", "In Progress", "Shipped", "Delivered", "Cancelled"];

export const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];

export const customOrderStatuses = ["Pending", "Discussing", "Accepted", "In Progress", "Completed", "Cancelled"];

export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export const whatsappLink = (message) => {
  const cleanNumber = brand.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};
