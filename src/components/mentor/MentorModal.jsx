const handleGetFeedback = async () => {
    if (!currentText.trim()) {
      alert('Please write some content first.');
      return;
    }

    setIsGettingFeedback(true);
    setFeedback(null);
    try {
      // יצירת הפרומפט החדש עם מבנה תשובה קשיח
      const prompt = `
        You are a world-class startup mentor. 
        STARTUP CONTEXT: "${ventureDescription || "Smoking cessation AI app"}"
        SECTION: "${sectionTitle}"
        USER DRAFT: "${currentText}"

        STRICT RESPONSE STRUCTURE:
        1. **The Critique for ${sectionTitle}:** Analyze the draft specifically for a ${ventureDescription} startup. What is missing?
        2. **Real-World Lesson:** Mention a specific example from a company like Noom, Pelton, or Airbnb regarding their "${sectionTitle}".
        3. **The Mentor's Question:** Ask one tough question to make the user think deeper.
        
        Constraint: Use professional but direct tone. Do not rewrite the draft.
      `;

      const data = await InvokeLLM({ prompt });
      
      if (data && data.response) {
        // הוספנו בדיקה קטנה כדי לראות אם הקונטקסט עבר
        const debugInfo = !ventureDescription ? "\n\n*(Note: Venture description was missing)*" : "";
        setFeedback(data.response + debugInfo);
      } else {
        setFeedback("I couldn't generate feedback. Please try again.");
      }
      
    } catch (error) {
      console.error('Error:', error);
      setFeedback('Error getting feedback. Please try again.');
    }
    setIsGettingFeedback(false);
  };