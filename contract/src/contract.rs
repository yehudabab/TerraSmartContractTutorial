#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{to_binary, coin, Binary, CosmosMsg, BankMsg, Deps, DepsMut, Env, MessageInfo, Response, StdResult};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{WalletResponse, ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{resolver, resolver_read, WalletState};

const CONTRACT_NAME: &str = "crates.io:dapp";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {

    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Deposit {} => try_deposit(deps, info),
        ExecuteMsg::Withdraw { amount } => try_withdraw(deps, info, amount),
    }
}

pub fn try_deposit(deps: DepsMut, info: MessageInfo) -> Result<Response, ContractError> {
    let ind = info.funds.iter().position(|c| c.denom == "uusd");
    let mut deposited_amount = 0 as u64;
    if ind != None {
        deposited_amount = info.funds[ind.unwrap()].amount.u128() as u64;
    }
    
    let key = info.sender.as_bytes();
    let retrieved = resolver_read(deps.storage).may_load(key)?;
    if retrieved != None {
        let retrieved = retrieved.unwrap();
        let new_ws = WalletState { 
            balance: retrieved.balance + deposited_amount, 
            history: retrieved.history + deposited_amount 
        };
        resolver(deps.storage).save(key, &new_ws)?;
    } else {
        let ws = WalletState { balance: deposited_amount, history: deposited_amount };
        resolver(deps.storage).save(key, &ws)?;
    }
    Ok(Response::new().add_attribute("method", "try_deposit"))
}
pub fn try_withdraw(deps: DepsMut, info: MessageInfo, amount: u64) -> Result<Response, ContractError> {
    let key = info.sender.as_bytes();
    let retrieved = resolver_read(deps.storage).may_load(key)?;

    if retrieved != None {
        let retrieved = retrieved.unwrap();
        if retrieved.balance >= amount {

            let new_ws = WalletState { 
                balance: retrieved.balance - amount,
                history: retrieved.history
            };
            resolver(deps.storage).save(key, &new_ws)?;
            
            let msg = CosmosMsg::Bank(BankMsg::Send {
                to_address: info.sender.clone().into(),
                amount: vec![coin(amount as u128, "uusd")]
            });

            Ok(Response::new().add_message(msg))
        } else {
            return Err(ContractError::Unauthorized {});
        }
    } else {
        return Err(ContractError::Unauthorized {});
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetBalance { address } => to_binary(&query_balance(deps, env, address)?),
    }
}

fn query_balance(deps: Deps, env: Env, address: String) -> StdResult<WalletResponse> {
    let global_balance = deps.querier.query_balance(&env.contract.address, "uusd").unwrap().amount.u128() as u64;

    let address = deps.api.addr_validate(&address)?;
    let key = address.as_bytes();

    let retrieved = resolver_read(deps.storage).may_load(key)?;
    if retrieved != None {
        let retrieved = retrieved.unwrap();
        Ok(WalletResponse { 
            balance: retrieved.balance,
            global_balance: global_balance,
            history: retrieved.history,
            str_msg: address.to_string() 
        })
    } else {
        Ok(WalletResponse { 
            balance: 0, 
            history: 0,
            global_balance: global_balance,
            str_msg: "not found".to_string() 
        })
    }
}