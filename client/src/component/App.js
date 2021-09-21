import React from "react";
import { LCDClient, Extension, MsgExecuteContract } from "@terra-money/terra.js";
import WalletPanel from "./WalletPanel";
import "./App.css";
import DisplayMessage from "./DisplayMessage";

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.correct_chain = 'bombay-11'; // 'localterra';
    this.chain_url = 'https://bombay-lcd.terra.dev'; //'http://localhost:1317';

    this.lcd = new LCDClient({
      URL: this.chain_url,
      chainID: this.correct_chain
    });

    this.state = {
      sm_state: 0,
      wallet_balance: 0.,
      deposit_history: '',
      contract_balance: '',
      global_balance: ''
    };

    this.wallet_address = '?';
    this.contract_address = 'terra170sgpkzdggel0nuswyrrdrdr56zys4ver3gjpj';
    this.extension = new Extension();
    this.tx_hashes = new Set();

    this.extension.on("onPost", i => {
      if (i.success) {
        let postJson = JSON.parse(i.msgs[0]);
        let txHash = i.result.txhash;
        if(!this.tx_hashes.has(txHash)) {
          this.tx_hashes.add(txHash);
          switch(postJson.type) {
            case "wasm/MsgExecuteContract":
              let is_deposit = postJson.value.execute_msg.deposit != null;
              let is_withdraw = postJson.value.execute_msg.withdraw != null;

              if(is_deposit) {
                let amount = parseFloat(postJson.value.coins[0].amount) * (10 ** (-6));
                this.setState({
                  wallet_balance: this.state.wallet_balance - amount,
                  deposit_history: this.state.deposit_history + amount,
                  contract_balance: this.state.contract_balance + amount,
                  global_balance: this.state.global_balance + amount,
                })
              } else if(is_withdraw) {
                let amount = parseFloat(postJson.value.execute_msg.withdraw.amount) * (10 ** (-6));
                this.setState({
                  wallet_balance: this.state.wallet_balance + amount,
                  contract_balance: this.state.contract_balance - amount,
                  global_balance: this.state.global_balance - amount,
                })
              }
              break;
            default:
              console.log('unknown post!' + postJson.type)
          }
        }
      }
    });

    this.extension.on("onConnect", w => {
      this.wallet_address = w.address;
      this.extension.info();
    });

    this.extension.on("onInfo", i => {
      console.log(i);

      if(i.chainID === this.correct_chain) {
        let should_fulfill = 2;
        let fulfilled = 0;

        // 1/2
        this.lcd.bank.balance(this.wallet_address).then(r => {
          let uust_balance = r.get('uusd');
          if (uust_balance != null) {
            this.setState({wallet_balance: parseFloat(uust_balance.toString()) * (10 ** (-6))})
          }
          fulfilled += 1;
          if(fulfilled === should_fulfill) {
            this.setState({ sm_state: 2 });
          }
        });

        // 2/2
        this.lcd.wasm.contractQuery(
          this.contract_address,
          {get_balance: {address: this.wallet_address}}).then(r => {
          this.setState({
            contract_balance: parseFloat(r.balance) / (10 ** 6),
            deposit_history: parseFloat(r.history) / (10 ** 6),
            global_balance: parseFloat(r.global_balance) / (10 ** 6)
          })
            fulfilled += 1;
            if(fulfilled === should_fulfill) {
              this.setState({ sm_state: 2 });
            }
          });
      } else if (i.chainID !== this.correct_chain) {
        this.setState({sm_state: 1});
      }
    });
  }

  clickHandler = (buttonName, extra) => {
    switch(buttonName) {
      case 'connect':
        this.extension.connect();
        break;
      case 'deposit':
        if (extra <= this.state.wallet_balance) {
          let k = new MsgExecuteContract(
            this.wallet_address,
            this.contract_address,
            {deposit: {}},
            { uusd: parseFloat(extra) * (10 ** 6) });
          console.log(this.extension.post({msgs: [k]}));
        } else {
          window.alert('not enough to deposit that amount!');
        }
        break;
      case 'withdraw':
        if (extra <= this.state.contract_balance) {
          let k = new MsgExecuteContract(
            this.wallet_address,
            this.contract_address,
            {withdraw: {amount: parseFloat(extra) * (10 ** 6)}});
          console.log(this.extension.post({msgs: [k]}));
        } else {
          window.alert('not enough to withdraw that amount!');
        }
        break;
      default:
        console.log('unknown click!');
        break;
    }
  };

  render() {
    return (
      <div className="component-app">
        <h3>Terra POC Dapp</h3>
        <WalletPanel
          clickHandler={this.clickHandler}
          wallet_address={this.wallet_address}
          contract_balance={this.state.contract_balance}
          global_balance={this.state.global_balance}
          contract_history={this.state.deposit_history}
          display_state={this.state.sm_state}
          wallet_balance={this.state.wallet_balance}/>
        <DisplayMessage display_state={this.state.sm_state} clickHandler={this.clickHandler} />
      </div>
    );
  }
}
