// OrdersTable.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, Download, Eye } from "lucide-react";
import { utils, writeFile } from "xlsx-js-style";
import { v4 as uuidv4 } from 'uuid';

const OrdersTable = ({ orders, setOrders, products = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    owner: "",
    total: 0,
    status: "قيد المعالجة",
    date: new Date().toISOString().split('T')[0],
    products: []
  });

  const filteredOrders = orders.filter(order =>
    order.id.toString().includes(searchTerm) ||
    order.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (orderId) => {
    const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا الطلب؟");
    if (confirmDelete) {
      setOrders(orders.filter(order => order.id !== orderId));
    }
  };

  const handleExportExcel = () => {
    const data = [
      ["رقم الطلب", "صاحب الطلب", "المجموع", "الحالة", "التاريخ"],
      ...orders.map(order => [
        order.id,
        order.owner,
        order.total.toFixed(2),
        order.status,
        new Date(order.date).toLocaleDateString('ar-EG')
      ])
    ];

    const ws = utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 15 }, 
      { wch: 25 },
      { wch: 15, t: 'n' },
      { wch: 20 },
      { wch: 20 }
    ];
    
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "الطلبات");
    writeFile(wb, "الطلبات.xlsx");
  };

  const OrderModal = ({ isEdit }) => {
    const currentOrder = isEdit ? editingOrder : newOrder;
    const [selectedProductIds, setSelectedProductIds] = useState(
      currentOrder.products.map(p => p.id)
    );

    useEffect(() => {
      setSelectedProductIds(currentOrder.products.map(p => p.id));
    }, [currentOrder]);

    const handleQuantityChange = (productId, newQuantity) => {
      const updatedProducts = currentOrder.products.map(p => 
        p.id === productId ? { ...p, quantity: Math.max(1, newQuantity) } : p
      );
      
      const total = updatedProducts.reduce((sum, { price, quantity }) => 
        sum + (price * quantity), 0);

      updateOrderState(updatedProducts, total);
    };

    const handleProductSelect = (e) => {
      const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
      const numericIds = selectedIds.map(id => Number(id));
      
      setSelectedProductIds(numericIds);
      
      const updatedProducts = numericIds.map(id => {
        const product = products.find(p => p.id === id);
        const existing = currentOrder.products.find(p => p.id === id);
        
        return existing || {
          ...product,
          quantity: 1
        };
      });

      const total = updatedProducts.reduce((sum, { price, quantity }) => 
        sum + (price * quantity), 0);

      updateOrderState(updatedProducts, total);
    };

    const updateOrderState = (products, total) => {
      if (isEdit) {
        setEditingOrder({ ...editingOrder, products, total });
      } else {
        setNewOrder({ ...newOrder, products, total });
      }
    };

    const handleSave = () => {
      if (!currentOrder.owner.trim() || currentOrder.total <= 0) {
        alert("الرجاء تعبئة الحقول المطلوبة بشكل صحيح");
        return;
      }

      if (isEdit) {
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? editingOrder : o));
        setEditingOrder(null);
      } else {
        setOrders(prev => [...prev, { 
          ...newOrder, 
          id: uuidv4(),
          date: new Date().toISOString().split('T')[0]
        }]);
        setNewOrder({
          owner: "",
          total: 0,
          status: "قيد المعالجة",
          date: new Date().toISOString().split('T')[0],
          products: []
        });
        setShowAddModal(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-96">
          <h3 className="text-xl mb-4 text-white">{isEdit ? 'تعديل الطلب' : 'إضافة طلب جديد'}</h3>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="اسم صاحب الطلب *"
              value={currentOrder.owner}
              onChange={(e) => 
                isEdit 
                  ? setEditingOrder({...editingOrder, owner: e.target.value})
                  : setNewOrder({...newOrder, owner: e.target.value})
              }
              className="bg-gray-700 text-white p-2 rounded w-full"
              required
            />
            
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">اختر المنتجات:</label>
              <select
                multiple
                value={selectedProductIds}
                onChange={handleProductSelect}
                className="bg-gray-700 text-white p-2 rounded w-full h-32"
              >
                {products.map(product => (
                  <option 
                    key={product.id} 
                    value={product.id}
                    className="hover:bg-indigo-600"
                  >
                    {product.name} - {product.price.toFixed(2)} ج.م
                  </option>
                ))}
              </select>
              <small className="text-gray-400">اضغط مع الاستمرار على Ctrl لاختيار أكثر من منتج</small>
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm">المنتجات المختارة:</label>
              {currentOrder.products.map(product => (
                <div key={product.id} className="flex items-center gap-2">
                  <span className="text-gray-300 flex-1">{product.name}</span>
                  <input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => handleQuantityChange(product.id, +e.target.value)}
                    className="bg-gray-700 text-white p-1 rounded w-16 text-center"
                  />
                  <span className="text-gray-400">
                    = {(product.price * product.quantity).toFixed(2)} ج.م
                  </span>
                </div>
              ))}
            </div>

            <input
              value={currentOrder.total.toLocaleString('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 2
              })}
              readOnly
              className="bg-gray-700 text-white p-2 rounded w-full cursor-not-allowed"
            />

            <select
              value={currentOrder.status}
              onChange={(e) => 
                isEdit 
                  ? setEditingOrder({...editingOrder, status: e.target.value})
                  : setNewOrder({...newOrder, status: e.target.value})
              }
              className="bg-gray-700 text-white p-2 rounded w-full"
            >
              <option value="قيد المعالجة">قيد المعالجة</option>
              <option value="تم التسليم">تم التسليم</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => isEdit ? setEditingOrder(null) : setShowAddModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {showAddModal && <OrderModal isEdit={false} />}
      {editingOrder && <OrderModal isEdit={true} />}

      <div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
        <h2 className='text-xl font-semibold text-gray-100'>قائمة الطلبات</h2>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <input
              type='text'
              placeholder='بحث...'
              className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
          </div>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">رقم الطلب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">صاحب الطلب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">المجموع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">التاريخ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-700">
            {filteredOrders.map((order) => (
              <motion.tr 
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-800"
              >
                <td className="px-6 py-4 text-right text-sm text-gray-100">#{order.id}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-300">{order.owner}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-300">
                  {order.total.toLocaleString('ar-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    minimumFractionDigits: 2
                  })}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === "تم التسليم" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-300">
                  {new Date(order.date).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-300 flex gap-2">
                  <button 
                    onClick={() => setEditingOrder({...order})}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(order.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className="text-green-400 hover:text-green-300"
                    onClick={() => {
                      const productsList = order.products
                        .map(p => `${p.name} - ${p.price.toFixed(2)} ج.م × ${p.quantity} = ${(p.price * p.quantity).toFixed(2)} ج.م`)
                        .join('\n');
                      alert(`المنتجات المطلوبة:\n${productsList}`);
                    }}
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          إضافة طلب
        </button>
        
        <button
          onClick={handleExportExcel}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download size={18} />
          تصدير إكسل
        </button>
      </div>
    </motion.div>
  );
};

export default OrdersTable;