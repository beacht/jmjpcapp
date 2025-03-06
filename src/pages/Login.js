import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import JMJButton from "../components/JMJButton";

const Login = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [clientType, setClientType] = useState("");
  const [questionnaireStep, setQuestionnaireStep] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); // Optional
  const [language, setLanguage] = useState("");
  const [dob, setDob] = useState("");
  const [menstrual, setMenstrual] = useState("");
  const [notes, setNotes] = useState("");
  // adminNotes default to empty string
  // unableToAct default to false
  // unableToSchedule default to false
  // verified default to false

  const today = new Date();
  const tenYearsAgo = new Date(today.setFullYear(today.getFullYear() - 10));
  const tenYearsAgoDate = tenYearsAgo.toISOString().split("T")[0];
  const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
  const threeMonthsAgoDate = threeMonthsAgo.toISOString().split("T")[0];

  const handleLogin = () => {
    if (phone) {
      const formattedPhone = phone.replace(/\D/g, "");
      login(formattedPhone);
    } else {
      setError("ERROR TEXT");
    }
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;

    // Only allow letters, spaces, and hyphens
    if (/^[A-Za-z\s-]*$/.test(value)) {
      setFirstName(value); // Update state if input is valid
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;

    // Only allow letters, spaces, and hyphens
    if (/^[A-Za-z\s-]*$/.test(value)) {
      setFirstName(value); // Update state if input is valid
    }
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    // Format the input as (XXX) XXX-XXXX
    if (input.length <= 3) {
      setPhone(input);
    } else if (input.length <= 6) {
      setPhone(`(${input.slice(0, 3)}) ${input.slice(3)}`);
    } else {
      setPhone(`(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`);
    }

    if(input.replace(/\D/g, "").length === 10) setError("");
  };

  const attemptReachStep = (step) => {
    // 0 = enter phone
    // 1 = continue pregnancy no/unsure/yes => 2/3/4
    // 2 = take client info, update the client object accordingly
    // 3 = looking for proof of positivity yes/no => 4/2
    // 4 = referral phone numbers, update the client object accordingly

    if(step === 1){
      if(phone.replace(/\D/g, "").length !== 10) setError("Please enter your 10-digit phone number");
      else setQuestionnaireStep(1);
    }

    if(step === 2){
      setQuestionnaireStep(2);
      // We do not need to update the client object here; we can wait until they've entered their information
    }

    if(step === 3){
      setQuestionnaireStep(3);
      // We do do not need to update the client object here; we will ask a follow-up question to send them to step 2 or 4
    }

    if(step === 4){
      setQuestionnaireStep(4);
      // Update the client object here. They are not interested in an abortion and should not be able to create an account
    }
  }

  return (
    <div className="w-screen h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://jmjpc.org/wp-content/uploads/2023/12/Headerdoctor-e1703173805204.webp')" }}>
      <div className="flex flex-col md:flex-row items-center justify-center md:gap-16 w-full h-full px-4 py-8 bg-black bg-opacity-50">
        {/* Left side: Flavor text */}
        <div className="text-white text-center md:text-left md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl font-bold mb-4 md:flex md:space-x-4">
            <span className="block md:inline-block">Your Pregnancy.</span>
            <span className="block md:inline-block">Your Decision.</span>
            <span className="block md:inline-block">Our Support.</span>
          </h2>
          <p className="text-lg">
            Your health is our highest priority. We provide the facts and support to help you make the best decision for your situation.
          </p>

          {clientType === "" && (<div className="mt-6 flex flex-row justify-center md:justify-start">
            <JMJButton onClick={() => setClientType("new")} color="green" text="New Client"></JMJButton>
            <JMJButton onClick={() => setClientType("returning")} color="green" text="Returning Client"></JMJButton>
          </div>)}
        </div>

        {/* Right side: Login form (either phone entry or new client questionnaire)*/}
          {clientType !== "" && (<div className="p-6 rounded-lg shadow-lg min-w-[300px] w-full px-4 md:max-w-[600px] md:w-[1/2] bg-JMJ">
            <img
              src="https://jmjpc.org/wp-content/uploads/2023/12/JMJ-Logo-ai.svg"
              alt="JMJ Logo"
              className="mb-6 w-32 h-auto brightness-0 invert mx-auto"
            />
            {clientType === "returning" && (
              <div>
                <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                className="p-2 rounded-lg mb-4 w-full text-center"
              />
              {phone.replace(/\D/g, "").length === 10 && (<button onClick={handleLogin} className="bg-JMJ text-white py-2 px-4 rounded-lg w-full">
                  Log In
              </button>)}
              {error && <p className="text-red-500 mt-4 text-center font-bold">{error}</p>}
            </div>)
            }
            {clientType === "new" && (
              <div>
                {questionnaireStep === 0 && (
                  <div>
                    <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter your phone number"
                    className="p-2 rounded-lg mb-4 w-full text-center"
                    />
                    {phone.replace(/\D/g, "").length === 10 && (<button onClick={() => attemptReachStep(1)} className="bg-JMJ text-white py-2 px-4 rounded-lg w-full">
                      Continue
                    </button>)}
                    {error && <p className="text-red-500 mt-4 text-center font-bold">{error}</p>}
                  </div>
                )}
                {questionnaireStep === 1 && (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-xl text-center font-bold text-white">How can we help you today?</p>
                    <p className="text-md text-center text-white pb-4">Do you intend to continue the pregnancy?</p>
                    <div className="w-[50%] flex flex-col justify-center">
                      <JMJButton text="No" onClick={() => attemptReachStep(2)} color={"white"}></JMJButton>
                      <JMJButton text="Unsure" onClick={() => attemptReachStep(3)} color={"white"}></JMJButton>
                      <JMJButton text="Yes" onClick={() => attemptReachStep(4)} color={"white"}></JMJButton>
                    </div>
                  </div>
                )}
                {questionnaireStep === 2 && (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-xl text-center font-bold text-white">Pregnancy Verification</p>
                    <p className="text-md text-center text-white pb-4">Before you make this important decision, we are here to help you determine the viability of your pregnancy. Please provide the following information to schedule an appointment.</p>
                    <div className="w-full flex flex-col justify-center">
                      <div className="flex flex-row gap-2">
                        <input
                          type="text"
                          value={firstName}
                          onChange={handleFirstNameChange}
                          placeholder="First Name"
                          className="p-2 rounded-lg mb-4 w-full text-center"
                        />
                        <input
                          type="text"
                          value={lastName}
                          onChange={handleLastNameChange}
                          placeholder="Last Name"
                          className="p-2 rounded-lg mb-4 w-full text-center"
                        />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (optional)"
                        className="p-2 rounded-lg mb-4 w-full text-center"
                      />
                      {/* Language */}
                      <p className="text-white">Preferred Language</p>
                      <select className="p-2 rounded-lg mb-4 w-full text-start" value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="English">English</option>
                        <option value="Spanish">Español</option>
                      </select>
                      {/* Date of Birth */}
                      <p className="text-white">Date of Birth</p>
                      <input className="p-2 rounded-lg mb-4 w-full text-center" type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={tenYearsAgoDate}/>
                      {/* Menstrual Date */}
                      <p className="text-white">First Day of Last Menstrual Period</p>
                      <input className="p-2 rounded-lg mb-4 w-full text-center" type="date" value={menstrual} onChange={(e) => setMenstrual(e.target.value)} max={threeMonthsAgoDate}/>
                      {/* Notes - optional */}
                      <input className="p-2 rounded-lg w-full text-start" type="" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"/>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>)}
      </div>
    </div>
  );
};

export default Login;
