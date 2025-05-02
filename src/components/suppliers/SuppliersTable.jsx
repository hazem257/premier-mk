import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, Download, ChevronDown, ChevronUp } from "lucide-react";
import { utils, writeFile } from "xlsx-js-style";

const COUNTRIES = [
  "مصر",
  "السعودية",
  "الإمارات",
  "الجزائر",
  "المغرب",
  "العراق",
  "الكويت",
  "قطر",
  "عُمان",
  "لبنان",
  "سوريا",
  "الأردن",
  "اليمن",
  "ليبيا",
  "تونس",
  "السودان",
  "الصومال",
  "موريتانيا",
  "البحرين",
  "فلسطين"
];

const SupplierTable = ({ suppliers, setSuppliers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    country: "",
  });
  const [expandedRows, setExpandedRows] = useState({});

  // Handlers
  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
  
  const handleDelete = (supplierId) => {
    const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا المورد؟");
    if (confirmDelete) {
      setSuppliers(suppliers.filter(supp => supp.id !== supplierId));
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setEditedData({...supplier});
  };

  const handleSaveEdit = () => {
    setSuppliers(suppliers.map(s => 
      s.id === editingSupplier.id ? {...editedData, id: s.id} : s
    ));
    setEditingSupplier(null);
  };

  const handleAdd = () => {
    setShowAddModal(true);
    setNewSupplier({ name: "", email: "", country: "" });
  };

  const handleSaveNew = () => {
    if (!newSupplier.name || !newSupplier.email || !newSupplier.country) {
      alert("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }
    
    const newId = suppliers.length > 0 
      ? Math.max(...suppliers.map(s => s.id)) + 1 
      : 1;
      
    setSuppliers([...suppliers, {...newSupplier, id: newId}]);
    setShowAddModal(false);
  };

  const handleCountryChange = (e, isEditModal = false) => {
    const value = e.target.value;
    isEditModal 
      ? setEditedData({...editedData, country: value}) 
      : setNewSupplier({...newSupplier, country: value});
  };

  const toggleRowExpand = (supplierId) => {
    setExpandedRows(prev => ({
      ...prev,
      [supplierId]: !prev[supplierId]
    }));
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (suppliers.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const data = [
      ["الاسم", "البريد الإلكتروني", "الدولة"],
      ...suppliers.map(supp => [supp.name, supp.email, supp.country])
    ];

    const ws = utils.aoa_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "الموردين");

    // تنسيق العناوين
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center" }
    };

    for (let col = 0; col < data[0].length; col++) {
      const cell = utils.encode_cell({ r: 0, c: col });
      ws[cell].s = headerStyle;
    }

    // تحديد عرض الأعمدة
    ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }];

    writeFile(wb, "الموردين.xlsx");
  };

  // Filtered Data
  const filteredSuppliers = suppliers.filter(supp => 
    supp.name.toLowerCase().includes(searchTerm) ||
    supp.email.toLowerCase().includes(searchTerm) ||
    supp.country.toLowerCase().includes(searchTerm)
  );

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-4 md:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg md:text-xl mb-4 text-white">إضافة مورد جديد</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newSupplier.country}
                onChange={(e) => handleCountryChange(e)}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الدولة</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1 md:px-4 md:py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm md:text-base"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNew}
                className="px-3 py-1 md:px-4 md:py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm md:text-base"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-4 md:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg md:text-xl mb-4 text-white">تعديل المورد</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editedData.name}
                onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editedData.country}
                onChange={(e) => handleCountryChange(e, true)}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingSupplier(null)}
                className="px-3 py-1 md:px-4 md:py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm md:text-base"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-100">المـورديـن</h2>
          <span className="bg-gray-700 text-green-400 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
            العدد: {suppliers.length}
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="بحث..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm md:text-base"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg flex items-center gap-1 text-xs md:text-sm"
            >
              <Plus size={14} className="md:size-[16px]" />
              <span>إضافة</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg flex items-center gap-1 text-xs md:text-sm"
            >
              <Download size={14} className="md:size-[16px]" />
              <span>تصدير</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الاســم</th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الأميل</th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الـدولة</th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map(supp => (
                <motion.tr
                  key={supp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-800 transition-colors"
                >
                  <td className="px-2 md:px-4 py-3 md:py-4">
                    <div className="flex items-center justify-end">
                      <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm md:text-base">
                          {supp.name.charAt(0)}
                        </div>
                      </div>
                      <div className="mr-2 md:mr-4">
                        <div className="text-sm font-medium text-gray-100">{supp.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right text-sm text-gray-300">{supp.email}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right text-sm text-gray-300">{supp.country}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <button 
                        onClick={() => handleEdit(supp)}
                        className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-900/30 transition-colors"
                        title="تعديل"
                      >
                        <Edit size={16} className="md:size-[18px]" />
                      </button>
                      <button 
                        onClick={() => handleDelete(supp.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30 transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={16} className="md:size-[18px]" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا توجد بيانات متاحة"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-2">
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map(supp => (
            <motion.div
              key={supp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
            >
              <div 
                className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => toggleRowExpand(supp.id)}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm mr-2">
                    {supp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-100">{supp.name}</div>
                    <div className="text-xs text-gray-400">{supp.country}</div>
                  </div>
                </div>
                {expandedRows[supp.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedRows[supp.id] && (
                <div className="p-3 pt-0 border-t border-gray-700 bg-gray-800">
                  <div className="mb-2">
                    <div className="text-xs text-gray-400">البريد الإلكتروني:</div>
                    <div className="text-sm text-gray-200">{supp.email}</div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(supp)}
                      className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-900/30 transition-colors text-xs flex items-center gap-1"
                    >
                      <Edit size={14} />
                      <span>تعديل</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(supp.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30 transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-400 bg-gray-900 rounded-lg border border-gray-700">
            {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا توجد بيانات متاحة"}
          </div>
        )}
      </div>

      {/* Pagination or Status */}
      <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-400 text-center">
        عرض {filteredSuppliers.length} من أصل {suppliers.length} مورد
      </div>
    </motion.div>
  );
};

export default SupplierTable;