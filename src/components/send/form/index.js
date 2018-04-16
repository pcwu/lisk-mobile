import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Button, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';
import styles from './styles';
import regex from '../../../constants/regex';

class Form extends React.Component {
  constructor() {
    super();

    this.state = {
      address: { value: '', validity: -1 },
      amount: { value: '', validity: -1 }
    }

    this.validator = {
      address: str => regex.address.test(str),
      amount: str => regex.amount.test(str),
    };
  }

  /**
   * @param {String} name - the key to set on state
   * @param {Any} value the Value corresponding the given key
   */
  changeHandler = (name, value) => {
    let validity = -1;
    if (value !== '') {
      validity = this.validator[name](value) ? 0 : 1;
    }

    this.setState({[name]: {
      value,
      validity,
    }});
  }

  goToNextState = () => {
    this.props.nextStep({
      amount: this.state.amount.value,
      address: this.state.address.value,
    });
  }

  render() {
    return (<View style={styles.container}>
        <View>
          <FormLabel>Address</FormLabel>
          <FormInput
            ref={input => this.address = input }
            onChangeText={(value) => this.changeHandler('address', value)}/>
          <FormValidationMessage labelStyle={styles.errorMessage}>
            {
              this.state.address.validity === 1 ?
                'Invalid address' : ''
            }
          </FormValidationMessage>
          <FormLabel>Amount</FormLabel>
          <FormInput
            ref={input => this.amount = input }
            onChangeText={(value) => this.changeHandler('amount', value)}/>
          <FormValidationMessage labelStyle={styles.errorMessage}>
            {
              this.state.amount.validity === 1 ?
                'Invalid amount value' : ''
            }
          </FormValidationMessage>
          <Button
            onPress={this.goToNextState}
            buttonStyle={styles.button}
            backgroundColor='#ff6236'
            title='Next' />
        </View>
      </View>);
  }
}

export default Form;