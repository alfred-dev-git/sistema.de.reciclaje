// Este archivo nos deja usar navigate() fuera de componentes React
let navigateRef: (path: string) => void;

export const setNavigate = (navFn: (path: string) => void) => {
  navigateRef = navFn;
};

export const navigateTo = (path: string) => {
  if (navigateRef) {
    navigateRef(path);
  } else {
    console.warn("⚠️ navigate aún no inicializado");
  }
};
