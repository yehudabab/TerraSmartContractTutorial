import React from "react";
import PropTypes from "prop-types";

import "./DisplayMessage.css";

export default class DisplayMessage extends React.Component {
  static propTypes = {
    display_state: PropTypes.number,
    clickHandler: PropTypes.func
  };

  handleConnectClick = () => {
    this.props.clickHandler('connect', null);
  };

  render() {
    switch(this.props.display_state) {
      case 0:
        // Entry point: wallet is not connected
        return (
          <div className="component-display">
            <div>Wallet not Connected!</div>
            <div>Click <button onClick={this.handleConnectClick}>here</button> to connect Terra Station Wallet</div>
            <div>Make sure you are on testnet (Bombay)</div>
          </div>
        );
      case 1:
        // Connected, but wrong chain
        return (
          <div className="component-display">
            <div>Wallet Connected, but to the wrong chain!</div>
            <div>Please connect to testnet (BOMBAY) on Terra Station Wallet</div>
          </div>);
      case 2:
        // Connected
        return (<div className="component-display"><div>Connected</div></div>);
      default:
        return (<div className="component-display"><div>ERR: Unknown state</div></div>);
    }
  }
}
