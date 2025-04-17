import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  DoctorDetails: {
    doctorId: string;
  };
  BookAppointment: {
    doctor: {
      id: string;
      name: string;
      department: string;
    };
  };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 