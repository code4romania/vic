import React from "react";
import PageLayout from "../layouts/PageLayout";
import { Text } from "@ui-kitten/components";

const Dashboard = ({ navigation }: any) => {
  const onBackButtonPress = () => {
    navigation.goBack();
  };

  return (
    <PageLayout title="Dashboard" onBackButtonPress={onBackButtonPress}>
      <Text category="h1">Dashboard</Text>
    </PageLayout>
  );
};

export default Dashboard;
