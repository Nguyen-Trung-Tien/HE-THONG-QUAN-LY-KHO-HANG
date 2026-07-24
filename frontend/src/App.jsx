import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import Layout from './components/Layout';
import RequireAuth from './auth/RequireAuth';
import RoleGuard from './auth/RoleGuard';
import PageSkeleton from './components/common/PageSkeleton';

// Lazy loaded page components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Orders = lazy(() => import('./components/OrderComponent/Orders'));
const Shippers = lazy(() => import('./components/ShipperComponent/Shippers'));
const Inventory = lazy(() => import('./components/InventoryComponent/Inventory'));
const Statistics = lazy(() => import('./components/Statistics'));
const ProductList = lazy(() => import('./components/ProductsComponent/ProductList'));
const SignIn = lazy(() => import('./components/SignIn'));
const SignUp = lazy(() => import('./components/SignUp'));
const Profile = lazy(() => import('./components/Profile'));
const Customer = lazy(() => import('./components/CustomerComponent/Customer'));
const Suppliers = lazy(() => import('./components/SuppliersComponent/Suppliers'));
const WarehouseManagement = lazy(() => import('./components/WarehouseManagement/WarehouseManagement'));
const Users = lazy(() => import('./components/UsersComponent/UsersComponent'));
const Settings = lazy(() => import('./components/Settings'));
const Notifications = lazy(() => import('./components/Notifications'));

function App() {
	const dispatch = useDispatch();
	const user = useSelector((state) => state.user.currentUser);

	// Apply global theme
	useEffect(() => {
		if (user?.preferredTheme) {
			if (user.preferredTheme === 'dark') {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			} else {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			}
		} else {
			const savedTheme = localStorage.getItem('theme');
			if (savedTheme === 'dark') {
				document.documentElement.classList.add('dark');
			} else if (savedTheme === 'light') {
				document.documentElement.classList.remove('dark');
			} else {
				const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
				if (prefersDark) {
					document.documentElement.classList.add('dark');
					localStorage.setItem('theme', 'dark');
				} else {
					document.documentElement.classList.remove('dark');
					localStorage.setItem('theme', 'light');
				}
			}
		}
	}, [user?.preferredTheme]);

	return (
		<>
			<ToastContainer position='top-right' autoClose={3000} />

			<Suspense fallback={<PageSkeleton />}>
				<Routes>
					<Route path='/sign-in' element={<SignIn />} />
					<Route path='/sign-up' element={<SignUp />} />
					<Route path='/profile' element={<Profile />} />

					<Route element={<RequireAuth />}>
						<Route path='/' element={<Layout />}>
							<Route index element={<Dashboard />} />
							<Route path='products' element={<ProductList />} />
							<Route path='inventory' element={<Inventory />} />
							<Route path='orders' element={<Orders />} />
							<Route path='shippers' element={<Shippers />} />
							
							{/* Admin, Dev & Accountant routes */}
							<Route element={<RoleGuard allowedRoles={['admin', 'dev', 'accountant']} />}>
								<Route path="stats" element={<Statistics />} />
							</Route>

							{/* Admin & Dev only routes */}
							<Route element={<RoleGuard allowedRoles={['admin', 'dev']} />}>
								<Route path='users' element={<Users />} />
							</Route>

							<Route path='suppliers' element={<Suppliers />} />
							<Route path='customer' element={<Customer />} />
							<Route
								path='WarehouseManagement'
								element={<WarehouseManagement />}
							/>
							<Route path='settings' element={<Settings />} />
							<Route path='notifications' element={<Notifications />} />
						</Route>
					</Route>
				</Routes>
			</Suspense>
		</>
	);
}

export default App;
