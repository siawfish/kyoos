import React from "react";
import { StyleSheet, Image } from "react-native";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import BookingDetails from "@/components/bookings/BookingDetails";
import Header from "@/components/bookings/BookingDetails/Header";
import Actions from "@/components/bookings/BookingDetails/Actions";
import Reschedule from "@/components/bookings/BookingDetails/Reschedule";
import { ConfirmActionSheet } from "@/components/ui/ConfirmActionSheet";
import { widthPixel } from "@/constants/normalize";

const Details = () => {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showReschedule, setShowReschedule] = React.useState(false);
  return (
    <ThemedSafeAreaView style={styles.container}>
      <Header onReschedule={()=>setShowReschedule(true)} />
      <BookingDetails />
      <Actions 
        onCancel={()=>setShowConfirm(true)}
      />
      {
        showConfirm && (
          <ConfirmActionSheet 
            isOpen={showConfirm} 
            isOpenChange={()=>setShowConfirm(!showConfirm)} 
            onConfirm={()=>setShowConfirm(false)} 
            title="Cancel Booking?" 
            icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
            description="Are you sure you want to cancel this booking? This action can not be reversed. Gerald will also be notified." 
            confirmText="Yes, Cancel Booking"
            cancelText="Cancel"
          />
        )
      }

      {
        showReschedule && <Reschedule isOpen={showReschedule} onClose={()=>setShowReschedule(false)} />
      }
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dangerIcon: {
    width: widthPixel(60),
    height: widthPixel(60),
  },
});

export default Details;
