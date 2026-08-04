import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { setNavigate } from "./refglobal.navigation";

// Este componente se monta una sola vez y registra navigate()
export default function AppNavigator() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return <Outlet />;
}
