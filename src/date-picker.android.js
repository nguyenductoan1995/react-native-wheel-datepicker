/* eslint-disable react/require-default-props */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/destructuring-assignment */
import React, { PureComponent } from 'react'
import { ColorPropType, StyleSheet, View, ViewPropTypes as RNViewPropTypes } from 'react-native'
import PropTypes from 'prop-types'
import moment from 'moment'
import Picker from './picker'

const ViewPropTypes = RNViewPropTypes || View.propTypes

const styles = StyleSheet.create({
  picker: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
})

const stylesFromProps = props => ({
  itemSpace: props.itemSpace,
  textColor: props.textColor,
  textSize: props.textSize,
  style: props.style,
})

export default class DatePicker extends PureComponent {
  static propTypes = {
    labelUnit: PropTypes.shape({
      year: PropTypes.string,
      month: PropTypes.string,
      date: PropTypes.string,
    }),
    order: PropTypes.string,
    date: PropTypes.instanceOf(Date).isRequired,
    maximumDate: PropTypes.instanceOf(Date),
    minimumDate: PropTypes.instanceOf(Date),
    mode: PropTypes.oneOf(['date', 'time', 'datetime']),
    onDateChange: PropTypes.func.isRequired,
    style: ViewPropTypes.style,
    textColor: ColorPropType,
    textSize: PropTypes.number,
    itemSpace: PropTypes.number,
  };

  static defaultProps = {
    labelUnit: { year: '', month: '', date: '' },
    order: 'D-M-Y',
    mode: 'date',
    maximumDate: moment().add(10, 'years').toDate(),
    minimumDate: moment().add(-100, 'years').toDate(),
    date: new Date(),
    style: null,
    textColor: '#333',
    textSize: 26,
    itemSpace: 20,
  };

  constructor(props) {
    super(props)

    const { date, minimumDate, maximumDate, labelUnit } = props

    this.state = { date, monthRange: [], yearRange: [] }

    this.newValue = {}

    this.parseDate(date)

    const mdate = moment(date)

    const dayNum = mdate.daysInMonth()
    this.state.dayRange = this.genDateRange(dayNum)

    const minYear = minimumDate.getFullYear()
    const maxYear = maximumDate.getFullYear()

    const { monthRange, yearRange } = this.state

    for (let i = 0; i <= 11; i++) {
      monthRange.push({ value: i, label: moment().month(i).format('MMMM') })
    }

    yearRange.push({ value: minYear, label: `${minYear}${labelUnit.year}` })

    for (let i = minYear + 1; i <= maxYear; i += 1) {
      yearRange.push({ value: i, label: `${i}${labelUnit.year}` })
    }
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.date !== nextProps.date) {
      return {
        date: nextProps.date,
      }
    }

    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.date !== this.state.date) {
      // Thục hiện update state
      this.parseDate(this.state.date)
    }
  }

  get timePicker() {
    const propsStyles = stylesFromProps(this.props)

    const [hours, minutes, format] = [[], [], []]

    for (let i = 0; i <= 24; i += 1) {
      hours.push(i)
    }

    for (let i = 0; i <= 59; i += 1) {
      minutes.push(i)
    }
    const { date } = this.state
    return [
      <View key="hour" style={styles.picker}>
        <Picker
          ref={(hour) => { this.hourComponent = hour }}
          {...propsStyles}
          selectedValue={date.getHours()}
          pickerData={hours}
          onValueChange={this.onHourChange}
        />
      </View>,
      <View key="minute" style={styles.picker}>
        <Picker
          ref={(minute) => { this.minuteComponent = minute }}
          {...propsStyles}
          selectedValue={date.getMinutes()}
          pickerData={minutes}
          onValueChange={this.onMinuteChange}
        />
      </View>,
      <View key="format" style={styles.picker}>
        <Picker
          ref={(format) => { this.formatComponent = format }}
          {...propsStyles}
          selectedValue={date.getFormat()}
          pickerData={['AM', 'PM']}
          onValueChange={this.onFormatChange}
        />
      </View>,
    ]
  }

  getValue = () => {
    const { minimumDate, maximumDate } = this.props
    const { year, month, date, hour, minute } = this.newValue
    const nextDate = new Date(year, month, date, hour, minute)

    if (nextDate < minimumDate) {
      return minimumDate
    }

    return nextDate > maximumDate ? maximumDate : nextDate
  }

  get datePicker() {
    const propsStyles = stylesFromProps(this.props)

    const { order, style } = this.props
    const { date, dayRange, monthRange, yearRange } = this.state

    if (!order.includes('D') && !order.includes('M') && !order.includes('Y')) {
      throw new Error('WheelDatePicker: you are using order prop wrong, default value is \'D-M-Y\'')
    }
    return order.split('-').map((key) => {
      switch (key) {
        case 'D': return (
          <View key="date" style={styles.picker}>
            <Picker
              {...propsStyles}
              style={style}
              ref={(dates) => { this.dateComponent = dates }}
              selectedValue={date.getDate()}
              pickerData={dayRange}
              onValueChange={this.onDateChange}
            />
          </View>
        )
        case 'M': return (
          <View key="month" style={styles.picker}>
            <Picker
              {...propsStyles}
              style={style}
              ref={(month) => { this.monthComponent = month }}
              selectedValue={date.getMonth()}
              pickerData={monthRange}
              onValueChange={this.onMonthChange}
            />
          </View>
        )
        case 'Y': return (
          <View key="year" style={styles.picker}>
            <Picker
              {...propsStyles}
              style={style}
              ref={(year) => { this.yearComponent = year }}
              selectedValue={date.getFullYear()}
              pickerData={yearRange}
              onValueChange={this.onYearChange}
            />
          </View>
        )
        default: return null
      }
    })
  }

  parseDate = (date) => {
    const mdate = moment(date);

    ['year', 'month', 'date', 'hour', 'minute'].forEach((s) => { this.newValue[s] = mdate.get(s) })
  }

  onYearChange = (year) => {
    const oldYear = this.newValue.year
    const { onDateChange } = this.props

    this.newValue.year = year
    this.checkDate(oldYear, this.newValue.month)
    onDateChange(this.getValue())
  };

  onMonthChange = (month) => {
    const oldMonth = this.newValue.month
    const { onDateChange } = this.props
    this.newValue.month = month
    this.checkDate(this.newValue.year, oldMonth)
    onDateChange(this.getValue())
  };

  onDateChange = (date) => {
    const { onDateChange } = this.props
    this.newValue.date = date
    this.checkDate(this.newValue.year, this.newValue.month)
    onDateChange(this.getValue())
  };

  onHourChange = (hour) => {
    const { onDateChange } = this.props
    this.newValue.hour = hour
    onDateChange(this.getValue())
  };

  onMinuteChange = (minute) => {
    const { onDateChange } = this.props
    this.newValue.minute = minute
    onDateChange(this.getValue())
  };

  genDateRange(dayNum) {
    const { labelUnit } = this.props
    const days = []

    for (let i = 1; i <= dayNum; i += 1) {
      days.push({ value: i, label: `${i}${labelUnit.date}` })
    }

    return days
  }


  checkDate(oldYear, oldMonth) {
    const currentMonth = this.newValue.month
    const currentYear = this.newValue.year
    const currentDay = this.newValue.date

    const { dayRange } = this.state

    let dayRanges = dayRange
    let dayNum = dayRange.length

    if (oldMonth !== currentMonth || oldYear !== currentYear) {
      dayNum = moment(`${currentYear}-${currentMonth + 1}`, 'YYYY-MM').daysInMonth()
    }

    if (dayNum !== dayRange.length) {
      dayRanges = this.genDateRange(dayNum)

      if (currentDay > dayNum) {
        this.newValue.date = dayNum
        this.dateComponent.setState({ selectedValue: dayNum })
      }

      this.setState({ dayRange: dayRanges })
    }
    const { mode, minimumDate, maximumDate } = this.props
    const unit = mode === 'date' ? 'day' : undefined
    const current = Object.assign({}, this.newValue, { date: this.newValue.date })
    let currentTime = moment(current)
    const min = moment(minimumDate)
    const max = moment(maximumDate)
    let isCurrentTimeChanged = false

    if (currentTime.isBefore(min, unit)) {
      [currentTime, isCurrentTimeChanged] = [min, true]
    } else if (currentTime.isAfter(max, unit)) {
      [currentTime, isCurrentTimeChanged] = [max, true]
    }

    if (isCurrentTimeChanged) {
      if (this.monthComponent) {
        this.monthComponent.setState({ selectedValue: currentTime.get('month') + 1 })
      }

      ['year', 'date', 'hour', 'minute'].forEach((segment) => {
        const ref = this[`${segment}Component`]

        return ref && ref.setState({ selectedValue: currentTime.get(segment) })
      })
    }
  }


  render() {
    const { mode } = this.props
    return (
      <View style={styles.row}>
        {['date', 'datetime'].includes(mode) && this.datePicker}
        {['time', 'datetime'].includes(mode) && this.timePicker}
      </View>
    )
  }
}
