import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import * as Location from "expo-location";
import { xml2js } from "xml-js";

export default function App() {
  const [responseArray, setResponseArray] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const response = await fetch(
          "https://bbsrmobileapp.capitalregiontransport.in/TransistService.asmx/GetNearByDepotList",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `Lattitude=${latitude}&Longitude=${longitude}`,
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const text = await response.text();
        const xmlDoc = xml2js(text, { compact: true, nativeType: true });
        const jsonString = xmlDoc.string._text;
        // console.log("JSON String from XML:", jsonString); // Debugging
        const dataArray = JSON.parse(jsonString);
        // console.log("Array from XML:", dataArray); // Debugging
        setResponseArray(dataArray);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {error ? (
          <Text>Error: {error}</Text>
        ) : (
          <View>
            <Text style={styles.header}>MyBus</Text>
            <Text style={{ textAlign: "center" }}>by Abhigyan Mohanta</Text>

            {responseArray.map((item) => (
              <View key={item.RowNo}>
                <Text>StationId: {item.StationId}</Text>
                <Text>
                  StationName: {item.StationName} ({item.StationName_M})
                </Text>
                <Text>Distance: {item.Distance}</Text>
                <Text>TotalMinute: {item.TotalMinute}</Text>
                <Text>RouteName: {item.RouteNames}</Text>
                <Text>RouteNo: {item.RouteNo}</Text>
                <Text>Running_RouteNo: {item.Running_RouteNo}</Text>
                <Text>Sch_RouteNo: {item.Sch_RouteNo}</Text>
                {/* item.Center_Lat */}
                {/* item.Center_Lon */}
                <Text></Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 22,
    paddingHorizontal: 15,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
});
