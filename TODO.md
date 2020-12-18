
# Steps 
1. Load all tokens 
2. Choose a few stablecoins as base currencies to generate trade quotes 
3. Try to load all return amounts 
4. Save all trade pairs to db
5. For those that load, check their inverse quote 
   1. Check token balance 
   2. If no balance, add a Job to buy one and continue to next pair
      1. Job runner immediately runs it.
      2. Job runner initially runs all jobs, checking if any pending orders are complete
   3. If balance, check return amount
6. Run arbitage    