const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // משיכת נתונים מכל המקורות שהגדרנו
      const [allVentures, allUsers, allMessages, allEvents, allVCFirms, allInvitations] = await Promise.all([
        Venture.list().catch(() => []),
        User.list().catch(() => []),
        VentureMessage.list().catch(() => []),
        FundingEvent.list().catch(() => []),
        VCFirm.list().catch(() => []),
        CoFounderInvitation.list().catch(() => [])
      ]);

      // --- חזרה ללוגיקה המקורית והאמינה ---

      // 1. סינון הודעות: רק פידבק משתמשים (כדי שלא תראה 88 הודעות זבל)
      const userFeedback = allMessages.filter(m => m.message_type === 'user_feedback');

      // 2. מיפוי מיזמים למשתמשים (כדי לראות מי בעל המיזם)
      const venturesByEmail = allVentures.reduce((acc, v) => {
        const email = v.created_by || v.owner_email;
        if (email) {
          if (!acc[email]) acc[email] = [];
          acc[email].push(v.name);
        }
        return acc;
      }, {});

      const usersWithData = allUsers.map(u => ({
        ...u,
        ventures: venturesByEmail[u.email] || []
      }));

      // 3. עדכון הסטייט
      setVentures(allVentures);
      setUsers(usersWithData);
      setMessages(userFeedback); // חוזר להיות מסונן ואמין
      setFundingEvents(allEvents);
      setVcFirms(allVCFirms);

      // 4. חישוב סטטיסטיקות מדויק
      const totalFunding = allEvents.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      setStats({
        ventures: allVentures.length, // כאן תראה 1 אם השרת חוסם
        funding: totalFunding,
        users: allUsers.length,
        messages: userFeedback.length
      });

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };