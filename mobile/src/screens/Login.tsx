import React from "react";
import PageLayout from "../layouts/PageLayout";
import { Text, Button } from "@ui-kitten/components";

const Login = ({ navigation }: any) => {
  const onLogin = () => {
    navigation.navigate("Dashboard");
  };

  return (
    <PageLayout title="Login">
      <Text category="h2">Login</Text>
      <Button onPress={onLogin}>Go To Dashboard</Button>
    </PageLayout>
  );
};

export default Login;
