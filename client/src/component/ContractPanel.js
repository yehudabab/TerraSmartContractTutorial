import React from "react";

import "./DisplayMessage.css";

export default class ContractPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
  }

  handleDepositClick = () => {
    this.props.clickHandler('deposit', this.state.value);
    this.setState({value: ""});
  };

  handleWithdrawClick = () => {
    this.props.clickHandler('withdraw', this.state.value);
    this.setState({value: ""});
  };

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    if (this.props.visible) {
      return (
        <div>
          <div>My Deposit Balance: </div>

          <div>{this.props.contract_balance + ' UST'}</div>
          <button name="deposit" onClick={this.handleDepositClick}> Deposit </button>
          <input value={this.state.value} onChange={this.handleChange} type='text'/>
          <button onClick={this.handleWithdrawClick}> Withdraw </button>
        </div>)
    } else {
      return (
        <div>
          <div>My Deposit Balance: </div>
          <div>?</div>
        </div>)
    }
  }
}
