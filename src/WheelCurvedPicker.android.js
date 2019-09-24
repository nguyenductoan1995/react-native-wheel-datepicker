import React, { PureComponent } from 'react'
import { ColorPropType, requireNativeComponent, View, ViewPropTypes as RNViewPropTypes } from 'react-native'
import PropTypes from 'prop-types'

const ViewPropTypes = RNViewPropTypes || View.propTypes

const stateFromProps = (props) => {
  let selectedIndex = 0

  const items = props.children.map(({ props: { value, label } }, index) => {
    if (value === props.selectedValue) {
      selectedIndex = index
    }

    return { value, label }
  })

  return { selectedIndex, items }
}

class WheelCurvedPicker extends PureComponent {
  static propTypes = {
    ...ViewPropTypes,
    textColor: ColorPropType,
    textSize: PropTypes.number,
    itemSpace: PropTypes.number,
    onValueChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    textSize: 26,
    itemSpace: 20,
    textColor: '#333',
  };

  state={}

  componentDidMount() {
    this.setState(stateFromProps(this.props))
  }

  static getDerivedStateFromProps(nextProps) {
    let selectedIndex = 0

    const items = nextProps.children.map(({ props: { value, label } }, index) => {
      if (value === nextProps.selectedValue) {
        selectedIndex = index
      }

      return { value, label }
    })

    return { selectedIndex, items }
  }

  onValueChange = ({ nativeEvent: { data } }) => {
    const { onValueChange } = this.props
    onValueChange(data)
  }


  render() {
    const { children, ...otherProps } = this.props
    const { items, selectedIndex } = this.state
    return (
      <WheelCurvedPickerNative
        {...otherProps}
        onValueChange={this.onValueChange}
        data={items}
        selectedIndex={parseInt(selectedIndex, 10)}
      />
    )
  }
}

class Item extends PureComponent {
  static propTypes = {
  };

   render: () => null;
}

WheelCurvedPicker.Item = Item

const WheelCurvedPickerNative = requireNativeComponent('WheelCurvedPicker', WheelCurvedPicker)

export default WheelCurvedPicker
