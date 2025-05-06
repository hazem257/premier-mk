import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus } from "lucide-react";

const initialUserData = [
  { id: 1, name: "John Doe", email: "john@example.com", Income: 1000, status: "manager" },
];

const EmployeeTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(initialUserData);
  const [Employees, setUsers] = useState(initialUserData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    Income: "",
    status: ""
  });

  useEffect(() => {
    const filtered = Employees.filter(
      (Employee) => 
        Employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        Employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, Employees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      name: "",
      email: "",
      Income: "",
      status: ""
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (Employee) => {
    setCurrentUser(Employee);
    setFormData({
      name: Employee.name,
      email: Employee.email,
      Income: Employee.Income,
      status: Employee.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentUser) {
      // Update existing Employee
      const updatedEmployees= Employees.map(Employee => 
        Employee.id === currentUser.id ? { ...formData, id: currentUser.id } : Employee
      );
      setUsers(updatedUsers);
    } else {
      // Add new Employee
      const newEmployees = {
        ...formData,
        id: Employee.length > 0 ? Math.max(...Employees.map(u => u.id)) + 1 : 1,
        Income: parseInt(formData.Income) || 0
      };
      setUsers([...Employees, newEmployees]);
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الموظف ؟")) {
      setUsers(Employees.filter(Employee => Employee.id !== id));
    }
  };

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-100'>الموظفين</h2>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search Employees...'
              className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
          </div>
          <button 
            onClick={handleAddUser}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
          >
            <Plus size={18} />
            إضافة موظف 
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700' style={{ width:"100%" , display:"flex" ,flexDirection:"column" , justifyContent:"space-between"}}>
          <thead >
            <tr style={{display:"flex" , justifyContent:"space-between", width:"100%" , alignItems:"center"}}>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                الاسم
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                البريد الإلكتروني
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                المرتب
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                الحاله
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                الإجراءات
              </th>
            </tr>
          </thead>

          <tbody className='divide-y divide-gray-700' >
            {filteredUsers.map((Employee) => (
              <motion.tr
                key={Employee.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{display:"flex" , justifyContent:"space-between", width:"100%" }}
              >
                <td className='px-6 py-4 whitespace-nowrap' >
                  <div className='flex items-center'>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-100'>{Employee.name}</div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                  {Employee.email}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
                    {Employee.Income}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-7 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      Employee.status === "Active"
                        ? "bg-green-800 text-green-100"
                        : "bg-red-800 text-red-100"
                    }`}
                  >
                    {Employee.status}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                  <button 
                    onClick={() => handleEditUser(Employee)}
                    className='text-indigo-400 hover:text-indigo-300 mr-2'
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(Employee.id)}
                    className='text-red-400 hover:text-red-300'
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit EMPLOYEE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              {currentUser ? "تعديل الموظف " : "إضافة موظف جديد"}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">الاسم</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">المرتب</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  {currentUser ? "حفظ التعديلات" : "إضافة موظف"}
                </button>
              </div>
            </form>
    
          </motion.div>
        </div>
        
      )}
    </motion.div>
  );
};

export default EmployeeTable;
