/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react'
import { ColorPropType, StyleSheet, View, ViewPropTypes as RNViewPropTypes, Platform } from 'react-native'
import PropTypes from 'prop-types'
import WheelCurvedPicker from './WheelCurvedPicker'

const ViewPropTypes = RNViewPropTypes || View.propTypes

const PickerItem = WheelCurvedPicker.Item

const styles = StyleSheet.create({
  picker: {
    height: 220,
  },
})


export default class Picker extends Component {
  static propTypes = {
    textColor: ColorPropType,
    textSize: PropTypes.number,
    itemSpace: PropTypes.number,
    itemStyle: ViewPropTypes.style,
    onValueChange: PropTypes.func.isRequired,
    pickerData: PropTypes.array.isRequired,
    style: ViewPropTypes.style,
  };

  static defaultProps = {
    textColor: '#333',
    textSize: 26,
    itemSpace: 20,
    itemStyle: null,
    style: null,
  };

  state = {
    selectedValue: this.props.selectedValue,
  };


  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.selectedValue !== prevState.selectedValue) {
      return { selectedValue: nextProps.selectedValue }
    }
    return null
  }

  handleChange = (selectedValue) => {
    const { onValueChange } = this.props
    this.setState({ selectedValue })
    onValueChange(selectedValue)
  };

  getValue = () => {
    const { selectedValue } = this.state
    return selectedValue
  }

  render() {
    const { pickerData, style, ...props } = this.props
    const { selectedValue } = this.state
       if(Platform.OS==='android'){
        return (
          // <WheelCurvedPicker
          //   {...props}
          //   style={[styles.picker, style]}
          //   selectedValue={selectedValue}
          //   onValueChange={this.handleChange}
          // >
          //   {pickerData.map((data, index) => (
          //     <PickerItem
          //       key={index}
          //       value={typeof data.value !== 'undefined' ? data.value : data}
          //       label={typeof data.label !== 'undefined' ? data.label : data.toString()}
          //     />
          //   ))}
          // </WheelCurvedPicker>
          null
        )
       }
       return (
        <WheelCurvedPicker
          {...props}
          style={[styles.picker, style]}
          selectedValue={selectedValue}
          onValueChange={this.handleChange}
        >
          {pickerData.map((data, index) => (
            <PickerItem
              key={index}
              value={typeof data.value !== 'undefined' ? data.value : data}
              label={typeof data.label !== 'undefined' ? data.label : data.toString()}
            />
          ))}
        </WheelCurvedPicker>
      )
    } 
}
