use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use cosmwasm_std::Storage;
use cosmwasm_storage::{bucket, bucket_read, Bucket, ReadonlyBucket};

pub static NAME_RESOLVER_KEY: &[u8] = b"storagekey";

pub fn resolver(storage: &mut dyn Storage) -> Bucket<WalletState> {
    bucket(storage, NAME_RESOLVER_KEY)
}

pub fn resolver_read(storage: &dyn Storage) -> ReadonlyBucket<WalletState> {
    bucket_read(storage, NAME_RESOLVER_KEY)
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct WalletState {
    pub balance: u64,
    pub history: u64
}