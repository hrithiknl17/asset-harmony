import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { motion } from "framer-motion";

const AppLayout = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="ml-64 flex-1 p-6 lg:p-8"
    >
      <Outlet />
    </motion.main>
  </div>
);

export default AppLayout;
