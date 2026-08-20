import * as SecureStore from "expo-secure-store";

export const save = async (key: string, value: any) => {
  await SecureStore.setItemAsync(key, value);
};

export const getValueFor = async (key: string) => {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    alert("🔐 Here's your value 🔐 \n" + result);
  } else {
    alert("No values stored under that key.");
  }
};
