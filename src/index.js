'use strict';

import { Platform, PickerIOS } from 'react-native';
import Pickers from './picker';
import DatePicker from './date-picker';

let DatePickerComponent = DatePicker;

const registerCustomDatePickerIOS = (CustomDatePickerIOS) => {
  if (Platform.OS === 'ios') {
    DatePickerComponent = CustomDatePickerIOS;
  }

  return DatePickerComponent;
};

const Picker = Platform.OS === "ios" ? PickerIOS : Pickers

module.exports = {Picker, DatePicker: DatePickerComponent, registerCustomDatePickerIOS };
