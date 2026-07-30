// Returns the new balance, or None if overflow happens
pub fn apply_deposit(balance: u64, amount: u64) -> Option<u64> {
    balance.checked_add(amount)
}

#[cfg(test)]
mod tests {
    use super::apply_deposit;
    use proptest::prelude::*;

    proptest! {
        #[test]
        fn deposit_never_shrinks_a_balance(
            balance in any::<u64>(),
            amount in any::<u64>()
        ) {
            match apply_deposit(balance, amount) {
                Some(new_balance) => {
                    prop_assert!(new_balance >= balance);
                },
                None => {
                    prop_assert!(balance.checked_add(amount).is_none());
                }
            }
        }
    }
}