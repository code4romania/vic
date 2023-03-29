import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native";
import {
  Layout,
  TopNavigation,
  Icon,
  TopNavigationAction,
} from "@ui-kitten/components";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  onBackButtonPress?: () => void;
}

const BackIcon = (props: any) => <Icon {...props} name="arrow-back" />;

export const PageLayout = ({
  children,
  title,
  onBackButtonPress,
}: PageLayoutProps) => (
  <SafeAreaView style={{ flex: 1 }}>
    <TopNavigation
      title={title}
      alignment="start"
      accessoryLeft={
        onBackButtonPress && (
          <TopNavigationAction icon={BackIcon} onPress={onBackButtonPress} />
        )
      }
    />
    <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {children}
    </Layout>
  </SafeAreaView>
);

export default PageLayout;
