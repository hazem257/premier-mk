import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import ProductsTable from "../components/products/ProductsTable";

const initialProducts = [
  { id: 1, name: "لحمة مفرومه", category: "لحوم", price: 59.99, stock: 143, sales: 0 },
];

const ProductsPage = () => {
  const [products, setProducts] = useState(initialProducts);

  // حساب الإحصائيات
  const totalProducts = products.length;
  const bestSeller = Math.max(...products.map(p => p.sales));
  const lowStock = Math.min(...products.map(p => p.stock));
  const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.sales), 0);

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='الـمــنـتـجـات' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* الإحصائيات */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          
          <StatCard 
            name='مجموع المنتجات' 
            icon={Package} 
            value={totalProducts.toLocaleString()} 
            color='#6366F1' 
          />
          <StatCard 
            name='الأعلى مبيعاَ' 
            icon={TrendingUp} 
            value={bestSeller.toLocaleString()} 
            color='#10B981' 
          />
          <StatCard 
            name='الأقل مخزوناَ' 
            icon={AlertTriangle} 
            value={lowStock.toLocaleString()} 
            color='#F59E0B' 
          />
          <StatCard 
            name='مجموع المكسب' 
            icon={DollarSign} 
            value={`${totalRevenue.toFixed(2)} ج . م`} 
            color='#EF4444' 
          />
        </motion.div>
        { /* جدول المنتجات */ }
        <ProductsTable 
          products={products} 
          setProducts={setProducts} 
        />
      </main>
    </div>
  );
};

export default ProductsPage;