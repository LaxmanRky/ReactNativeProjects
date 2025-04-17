import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: {
    screen?: string;
    initial?: boolean;
  };
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