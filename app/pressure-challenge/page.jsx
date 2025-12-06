export default function PressureChallenge() {
  const [venture, setVenture] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isVCFollowUp, setIsVCFollowUp] = useState(false);
  const [followUpParams, setFollowUpParams] = useState(null);
  const [challengeAlreadyCompleted, setChallengeAlreadyCompleted] = useState(false);
  const chatEndRef = useRef(null);
  const timerRefs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const vcFollowUp = urlParams.get('vcFollowUp') === 'true';
    const messageId = urlParams.get('messageId');
    const firmId = urlParams.get('firmId');

    if (vcFollowUp && messageId && firmId) {
      setIsVCFollowUp(true);
      setFollowUpParams({ messageId, firmId });
    }

    const loadVenture = async () => {
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);
          
          if (!vcFollowUp && currentVenture.pressure_challenge_completed) {
            setEvaluation(currentVenture.pressure_challenge_evaluation);
            setIsFinished(true);
            setChallengeAlreadyCompleted(true);
            setConversation([
              { type: 'bot', text: `You have already completed the Pressure Challenge. Your score was ${currentVenture.pressure_challenge_score}/10.` }
            ]);
          }
        } else {
          setConversation([{ type: 'bot', text: "No venture found. Please create a venture first." }]);
          setIsFinished(true);
        }
      } catch (error) {
        console.error("Error loading venture:", error);
        setConversation([{ type: 'bot', text: "Error loading venture data." }]);
        setIsFinished(true);
      }
      setIsLoading(false);
    };

    loadVenture();
    
    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return <div>Test with useEffect</div>
}