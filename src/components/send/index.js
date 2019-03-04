import React from 'react';
import { BackHandler } from 'react-native';
import connect from 'redux-connect-decorator';
import { translate } from 'react-i18next';
import MultiStep from '../multiStep';
import Recipient from './recipient';
import AddToBookmark from './addToBookmark';
import Amount from './amount';
import Reference from './reference';
import Overview from './overview';
import SecondPassphrase from './secondPassphrase';
import Result from './result';
import { IconButton } from '../toolBox/button';
import { themes, colors } from '../../constants/styleGuide';
import withTheme from '../withTheme';
import getStyles from './styles';
import Progress from './progress';

@connect(state => ({
  accounts: state.accounts,
  settings: state.settings,
}), {})
class Send extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      tabBarVisible: params.tabBar,
      title: params.title || 'Send',
      headerLeft: params.showButtonLeft ? (
        <IconButton
          title=''
          icon='back'
          onPress={params.action}
          style={params.styles && params.styles.back}
          color={params.theme === themes.light ? colors.light.black : colors.dark.white}
        />
      ) : (
        <IconButton
          color='transparent'
          icon='back'
        />
      ),
    };
  };

  componentDidMount() {
    const { navigation } = this.props;

    this.subs = [
      navigation.addListener('didFocus', this.didFocus),
      navigation.addListener('willBlur', this.willBlur),
    ];

    navigation.setParams({
      showButtonLeft: false,
    });
  }

  componentDidUpdate(prevProps) {
    this.checkQuery(prevProps.navigation.getParam('query', {}));
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.remove());
  }

  checkQuery = (prevQuery = {}) => {
    const query = this.props.navigation.getParam('query', {});

    if ((prevQuery !== query) && query && (Object.keys(query).length)) {
      this.nav.reset(query);
      this.props.navigation.setParams({
        query: {},
      });
    }
  }

  didFocus = () => {
    const {
      styles,
      theme,
      navigation,
      accounts,
      settings,
      t,
    } = this.props;

    navigation.setParams({ styles, theme });
    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressedAndroid);

    if (navigation.getParam('initialize', false)) {
      this.nav.move({
        to: 4,
        data: {
          address: accounts.info[settings.token.active],
          amount: 0.1,
          reference: t('Account initialization'),
        },
      });
    } else {
      this.checkQuery();
    }
  }

  willBlur = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressedAndroid);
  }

  finalCallback = () => {
    this.props.navigation.navigate({ routeName: 'Home' });
  }

  onBackButtonPressedAndroid = () => {
    const action = this.props.navigation.getParam('action', false);

    if (action && typeof action === 'function') {
      action();
      return true;
    }

    return false;
  }

  render() {
    const {
      styles,
      accounts,
      navigation,
      settings,
    } = this.props;

    const steps = [
      {
        component: Recipient,
        props: {
          title: 'form',
          accounts,
        },
      },
      {
        component: AddToBookmark,
        props: {
          title: 'addToBookmark',
        },
      },
      {
        component: Amount,
        props: {
          title: 'amount',
          settings,
          accounts,
        },
      },
      {
        component: Reference,
        props: {
          title: 'reference',
        },
      },
      {
        component: Overview,
        props: {
          title: 'Overview',
        },
      },
      {
        component: Result,
        props: {
          title: 'result',
        },
      },
    ];

    if (accounts.info[settings.token.active].secondPublicKey) {
      steps.splice(4, 0, {
        component: SecondPassphrase,
        props: {
          title: 'secondPassphrase',
        },
      });
    }

    return (
      <MultiStep
        ref={(el) => { this.nav = el; }}
        navStyles={{ multiStepWrapper: styles.multiStepWrapper }}
        finalCallback={this.finalCallback}
        Progress={Progress}
      >
        {steps.map(step => (
          <step.component
            key={step.props.title}
            navigation={navigation}
            {...step.props}
          />
        ))}
      </MultiStep>
    );
  }
}

export default withTheme(translate()(Send), getStyles());
