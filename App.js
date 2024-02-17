import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import * as Location from "expo-location";
import { xml2js } from "xml-js";
import MapView, { Marker } from "react-native-maps";
import { FlashList } from "@shopify/flash-list";

export default function App() {
  const [responseArray, setResponseArray] = useState([]);
  const [error, setError] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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
        setLatitude(latitude);
        setLongitude(longitude);

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
        if (text.includes("NO NEARBY STATIONS AVAILABLE")) {
          throw new Error("No nearby stations available");
        } else {
          const xmlDoc = xml2js(text, { compact: true, nativeType: true });
          const jsonString = xmlDoc.string._text;
          // console.log("JSON String from XML:", jsonString); // Debugging
          const dataArray = JSON.parse(jsonString);
          // console.log("Array from XML:", dataArray); // Debugging
          setResponseArray(dataArray);
        }
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
          <View>
            <Text style={styles.header}>MoBus Clone</Text>
            <Text style={{ textAlign: "center" }}>RE by Abhigyan Mohanta</Text>
            <Text>Error: {error}</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.header}>MoBus Clone</Text>
            <Text style={{ textAlign: "center" }}>RE by Abhigyan Mohanta</Text>

            <FlashList
              data={responseArray}
              renderItem={({ item }) => (
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
                  <MapView
                    style={styles.map}
                    region={{
                      latitude: parseFloat(item.Center_Lat),
                      longitude: parseFloat(item.Center_Lon),
                      latitudeDelta: 0.015,
                      longitudeDelta: 0.0121,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                      }}
                      title={"Current Location"}
                    />
                    <Marker
                      coordinate={{
                        latitude: parseFloat(item.Center_Lat),
                        longitude: parseFloat(item.Center_Lon),
                      }}
                      title={item.StationName}
                      description={item.Distance}
                    />
                  </MapView>
                  <Text></Text>
                </View>
              )}
              estimatedItemSize={200}
            />
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
  map: {
    width: "100%",
    height: 300,
  },
});
