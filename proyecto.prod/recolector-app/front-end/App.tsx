import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainNavigator from "./src/main-navigator";
import 'react-native-gesture-handler';
import { navigationRef } from "./src/navigation/refglobal-navigation";

const App: React.FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <MainNavigator />
    </NavigationContainer>
  );
};

export default App;
