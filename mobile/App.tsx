import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { default as theme } from "./src/common/theme/theme.json";
import { default as mapping } from "./src/common/theme/mappings.json";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import * as Font from "expo-font";
import { AppNavigator } from "./src/routes/Navigation";

export default () => {
  // init fonts
  const [fontsLoaded] = Font.useFonts({
    "roboto-bold": require("./src/assets/fonts/Roboto-Bold.ttf"),
    "roboto-medium": require("./src/assets/fonts/Roboto-Medium.ttf"),
    "roboto-regular": require("./src/assets/fonts/Roboto-Regular.ttf"),
    "titilium-web": require("./src/assets/fonts/TitilliumWeb-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider
        {...eva}
        theme={{ ...theme }}
        customMapping={mapping}
      >
        <AppNavigator />
      </ApplicationProvider>
    </>
  );
};
