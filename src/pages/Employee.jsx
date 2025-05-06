import { UserCheck, UserPlus, UsersIcon,  HandCoins  } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
//import UsersTable from "../components/users/UsersTable";
import EmployeeTable from "../components/employee/EmployeeTable"
const userStats = {
	totalUsers: ``,
	newUsersToday: ``,
	activeUsers: ``,
	userPoints: ``,
};

const Employee = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='الــمـوظـفـيـن' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name='مجموع الموظفين'
						icon={UsersIcon}
						value={userStats.totalUsers.toLocaleString()}
						color='#6366F1'
					/>
					<StatCard name='الموظفين الجدد' icon={UserPlus} value={userStats.newUsersToday} color='#10B981' />
					
				</motion.div>

				<EmployeeTable />

	
			</main>
		</div>
	);
};
export default Employee;
