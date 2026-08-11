"use client";

import { useState, useEffect, useRef } from "react";
import PageContainer from "@/components/PageContainer";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  Package,
  Plus,
  Search,
  Upload,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  Layers,
  IndianRupee,
  AlertTriangle,
  FolderPlus,
  Tag,
  ImageIcon,
  TrendingUp,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  createdAt?: any;
}

interface ProductItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt?: any;
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryListModalOpen, setIsCategoryListModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catNameInput, setCatNameInput] = useState("");

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodImagePreview, setProdImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "product" | "category";
    title: string;
    message: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Fetch Categories Subscribed Real-Time
  useEffect(() => {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CategoryItem[];
        setCategories(list);
      },
      (err) => {
        console.warn("Categories query fallback:", err);
        onSnapshot(categoriesRef, (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as CategoryItem[];
          setCategories(list);
        });
      }
    );
    return () => unsub();
  }, []);

  // 2. Fetch Products Subscribed Real-Time
  useEffect(() => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ProductItem[];
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Products query fallback:", err);
        onSnapshot(productsRef, (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as ProductItem[];
          setProducts(list);
          setLoading(false);
        });
      }
    );
    return () => unsub();
  }, []);

  // --- CATEGORY HANDLERS ---
  const handleOpenAddCategoryModal = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCategoryId(cat.id);
      setCatNameInput(cat.name);
    } else {
      setEditingCategoryId(null);
      setCatNameInput("");
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;
    setSaving(true);
    try {
      if (editingCategoryId) {
        await updateDoc(doc(db, "categories", editingCategoryId), {
          name: catNameInput.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "categories"), {
          name: catNameInput.trim(),
          createdAt: serverTimestamp(),
        });
      }
      setIsCategoryModalOpen(false);
      setCatNameInput("");
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategoryClick = (cat: CategoryItem) => {
    setDeleteTarget({
      id: cat.id,
      type: "category",
      title: "Delete Category",
      message: `Are you sure you want to delete category "${cat.name}"? Products in this category will remain unchanged.`,
    });
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProductModal = () => {
    setEditingProductId(null);
    setProdName("");
    setProdPrice("");
    setProdStock("10");
    setProdImagePreview(null);
    if (categories.length > 0) {
      setProdCategoryId(categories[0].id);
    } else {
      setProdCategoryId("");
    }
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdCategoryId(product.categoryId || "");
    setProdPrice(product.price.toString());
    setProdStock(product.stock.toString());
    setProdImagePreview(product.imageUrl || null);
    setIsProductModalOpen(true);
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProdImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) {
      alert("Please fill in required fields (Product Name, Price)");
      return;
    }

    setSaving(true);
    setIsUploadingImage(true);
    try {
      let finalImageUrl = prodImagePreview || "";

      // Upload base64 image to ImageKit via API route
      if (prodImagePreview && prodImagePreview.startsWith("data:image")) {
        const formData = new FormData();
        formData.append("file", prodImagePreview);
        formData.append(
          "fileName",
          `product_${prodName.replace(/\s+/g, "_")}_${Date.now()}.jpg`
        );

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url || finalImageUrl;
        }
      }

      const matchedCategory = categories.find((c) => c.id === prodCategoryId);
      const categoryName = matchedCategory ? matchedCategory.name : "General";

      const productData = {
        name: prodName.trim(),
        categoryId: prodCategoryId || "general",
        categoryName: categoryName,
        price: parseFloat(prodPrice) || 0,
        stock: parseInt(prodStock) || 0,
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), productData);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }

      setIsProductModalOpen(false);
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    } finally {
      setSaving(false);
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProductClick = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({
      id: product.id,
      type: "product",
      title: "Delete Product",
      message: `Are you sure you want to delete product "${product.name}"?`,
    });
  };

  const handleConfirmGenericDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "product") {
        await deleteDoc(doc(db, "products", deleteTarget.id));
      } else if (deleteTarget.type === "category") {
        await deleteDoc(doc(db, "categories", deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  };

  // --- FILTERED PRODUCTS & STATS ---
  const filteredProducts = products.filter((prod) => {
    const matchSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.categoryName &&
        prod.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (activeCategoryFilter !== "all" && prod.categoryId !== activeCategoryFilter) {
      return false;
    }
    return true;
  });

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const inStockCount = products.filter((p) => p.stock > 0).length;

  return (
    <PageContainer
      title="Products & Inventory"
      subtitle="Manage gym supplements, merchandise, equipment, categories, and sales"
      actionText="+ Add Product"
      onActionClick={handleOpenAddProductModal}
    >
      {/* Top Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Products
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {products.length}
            </span>
            <span className="text-xs font-semibold text-zinc-400">Items Listed</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Product Categories
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {categories.length}
            </span>
            <button
              onClick={() => setIsCategoryListModalOpen(true)}
              className="cursor-pointer text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
            >
              Manage Categories →
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Active Inventory
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {inStockCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              In Stock
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Stock Value
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-600 dark:text-amber-400">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              ₹{totalInventoryValue.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Value
            </span>
          </div>
        </div>
      </div>

      {/* Main Table / Grid Container */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 px-5 py-3.5 gap-3 dark:border-zinc-800">
          {/* Dynamic Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveCategoryFilter("all")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCategoryFilter === "all"
                  ? "bg-amber-400 text-black shadow-xs font-semibold"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              All Products ({products.length})
            </button>

            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeCategoryFilter === cat.id
                      ? "bg-amber-400 text-black shadow-xs font-semibold"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}

            <button
              onClick={() => handleOpenAddCategoryModal()}
              className="cursor-pointer flex items-center gap-1 rounded-lg border border-dashed border-amber-400/60 bg-amber-400/10 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-400/20 dark:text-amber-300 whitespace-nowrap"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>+ Category</span>
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-48 rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs font-medium text-zinc-900 outline-none focus:border-amber-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-amber-400"
              />
            </div>

            <button
              onClick={() => setIsCategoryListModalOpen(true)}
              className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Tag className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Categories</span>
            </button>

            <button
              onClick={handleOpenAddProductModal}
              className="cursor-pointer flex h-8.5 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 text-xs font-semibold text-black hover:bg-amber-500 shadow-md transition-transform active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
            <span className="text-xs font-semibold text-zinc-500">
              Loading inventory products...
            </span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-400/30">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No Products Found
            </h3>
            <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              Add supplements, gym gear, protein shakes, or apparel to start tracking sales.
            </p>
            <button
              onClick={handleOpenAddProductModal}
              className="cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-500 transition-colors"
            >
              + Add Product Now
            </button>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-3 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-zinc-400">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-[10px] font-medium">No Image</span>
                      </div>
                    )}

                    {/* Category Badge Pill */}
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-black/70 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-400/30">
                      {prod.categoryName || "General"}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {prod.name}
                  </h4>

                  {/* Price & Stock info */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-semibold text-amber-700 dark:text-amber-400">
                      ₹{prod.price.toLocaleString("en-IN")}
                    </span>

                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                        prod.stock > 5
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : prod.stock > 0
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                      }`}
                    >
                      {prod.stock > 0 ? `${prod.stock} in stock` : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <button
                    onClick={(e) => handleOpenEditProductModal(prod, e)}
                    className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    title="Edit Product"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteProductClick(prod, e)}
                    className="cursor-pointer flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400"
                    title="Delete Product"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL 1: ADD / EDIT PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingProductId ? "Edit Gym Product" : "Add New Product"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 flex flex-col gap-4">
              {/* Product Image Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Image (ImageKit Upload)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer relative flex flex-col items-center justify-center h-36 w-full rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 transition-colors overflow-hidden group"
                >
                  {prodImagePreview ? (
                    <div className="relative h-full w-full">
                      <img
                        src={prodImagePreview}
                        alt="Product Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                        Click to Change Image
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                      <Upload className="h-6 w-6 text-amber-500" />
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Click to Upload Product Image
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Will be uploaded directly to ImageKit CDN
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProductFileChange}
                  className="hidden"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optimum Nutrition Whey Protein 2kg"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductModalOpen(false);
                      handleOpenAddCategoryModal();
                    }}
                    className="cursor-pointer text-[11px] font-semibold text-amber-600 hover:underline dark:text-amber-400"
                  >
                    + Add New Category
                  </button>
                </div>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2999"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isUploadingImage}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-black shadow-xs hover:bg-amber-500"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>{editingProductId ? "Save Changes" : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD / EDIT CATEGORY MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingCategoryId ? "Edit Product Category" : "Add New Category"}
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supplements, Merchandise, Proteins"
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:bg-zinc-800"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-500"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CATEGORIES LIST MANAGEMENT MODAL --- */}
      {isCategoryListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Tag className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Manage Product Categories ({categories.length})
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryListModalOpen(false)}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">
                  Category Name List
                </span>
                <button
                  onClick={() => {
                    setIsCategoryListModalOpen(false);
                    handleOpenAddCategoryModal();
                  }}
                  className="cursor-pointer flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 border border-dashed rounded-xl">
                  No categories created yet. Click Add Category to get started.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                  {categories.map((cat) => {
                    const prodCount = products.filter((p) => p.categoryId === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {cat.name}
                          </span>
                          <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                            {prodCount} Products
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setIsCategoryListModalOpen(false);
                              handleOpenAddCategoryModal(cat);
                            }}
                            className="cursor-pointer flex h-6.5 w-6.5 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                            title="Edit Category"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategoryClick(cat)}
                            className="cursor-pointer flex h-6.5 w-6.5 items-center justify-center rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-900 dark:text-red-400"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-2 flex justify-end border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryListModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title || "Confirm Deletion"}
        message={deleteTarget?.message || "Are you sure you want to delete this item?"}
        loading={deleting}
        onConfirm={handleConfirmGenericDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
