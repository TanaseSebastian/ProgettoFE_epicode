export const processExpensesLocally = (data, uid1, uid2, {
    setExpenses,
    setUtente1Balance,
    setUtente2Balance,
    setCombinedBalance,
    setCategorie,
    setTotalThisMonth,
  }) => {
    const enrichedExpenses = data.map((e) => ({
      ...e,
      isMine: e.uid === uid1,
    }));
  
    const user1Expenses = enrichedExpenses.filter((e) => e.uid === uid1);
    const user2Expenses = enrichedExpenses.filter((e) => e.uid === uid2);
  
    const user1Total = user1Expenses.reduce((acc, curr) => acc + (curr.importo || 0), 0);
    const user2Total = user2Expenses.reduce((acc, curr) => acc + (curr.importo || 0), 0);
    const combinedTotal = user1Total + user2Total;
  
    const categoriesData = enrichedExpenses.reduce((acc, curr) => {
      const cat = curr.categoria;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += curr.importo || 0;
      return acc;
    }, {});
  
    const currentDate = new Date();
    const thisMonth = currentDate.getMonth();
    const thisYear = currentDate.getFullYear();
  
    const expensesThisMonth = enrichedExpenses.filter(
      (e) => e.timestamp.toDate().getMonth() === thisMonth &&
            e.timestamp.toDate().getFullYear() === thisYear
    );
  
    const totalThisMonth = expensesThisMonth.reduce((acc, curr) => acc + (curr.importo || 0), 0);
  
    // Set degli state
    setExpenses(enrichedExpenses);
    setUtente1Balance(user1Total);
    setUtente2Balance(user2Total);
    setCombinedBalance(combinedTotal);
    setCategorie(categoriesData);
    setTotalThisMonth(totalThisMonth);
  };
  