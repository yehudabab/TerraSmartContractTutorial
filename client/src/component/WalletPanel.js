// import Button from "./Button";
import React from "react";
import PropTypes from "prop-types";

import "./WalletPanel.css";
import ContractPanel from "./ContractPanel";

export default class WalletPanel extends React.Component {
  static propTypes = {
    clickHandler: PropTypes.func,
    wallet_address: PropTypes.string,
  };

  clickHandler = (buttonName, extra) => {
    this.props.clickHandler(buttonName, extra);
  };

  render() {
    return (
      <div className="component-wallet-panel">
        <div>
          <div>My Wallet Address: </div>
          <div>{this.props.display_state >= 2 ? this.props.wallet_address : '?'}</div>
        </div>
        <div>
          <div>My Local Wallet Balance: </div>
          <div>{this.props.display_state >= 2 ? (this.props.wallet_balance + ' UST') : '?'}</div>
        </div>
        <ContractPanel clickHandler={this.clickHandler} visible={this.props.display_state >= 2} contract_balance={this.props.contract_balance}> </ContractPanel>
        <div>
          <div>This user historically deposited in the Dapp: </div>
          <div>{this.props.display_state >= 2 ? (this.props.contract_history + ' UST') : '?'}</div>
        </div>
        <div>
          <div>Total Deposits in Dapp (Global Balance): </div>
          <div>{this.props.display_state >= 2 ? (this.props.global_balance + ' UST') : '?'}</div>
        </div>
      </div>
    );
  }
}
