import React, { useState } from "react";
import { createNewClient, updateClient } from "../helpers/client";
import { useAuth } from "../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import JMJButton from "../components/JMJButton";

const Login = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [clientType, setClientType] = useState("");
  const [questionnaireStep, setQuestionnaireStep] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
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
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsAgoDate = threeMonthsAgo.toISOString().split("T")[0];

  const handleLogin = async () => {
    const formattedPhone = phone.replace(/\D/g, "");
    // Check if a client document exists with the given phone number
    const clientDocRef = doc(db, "clients", formattedPhone);
    const clientDoc = await getDoc(clientDocRef);

    if (clientDoc.exists()) {
      const clientData = clientDoc.data();

      // If firstName and lastName are empty, ask them to call
      if (!clientData.firstName || !clientData.lastName) {
        setError("Please call to schedule an appointment.");
      } 
      // If verified is false, ask them to check texts or call for verification
      else if (!clientData.verified) {
        setError("Please check your texts for verification or call for assistance.");
      } 
      // If verified is true, but unableToAct is true, tell them the phone number is restricted
      else if (clientData.verified && clientData.unableToAct) {
        setError("This client's access is restricted.");
      } 
      // If verified is true and unableToAct is false, log them in
      else if (clientData.verified && !clientData.unableToAct) {
        login(formattedPhone, true, false);
      }
    } else {
      setError("No client on file; please refresh and try again")
    }
  };

  const updateClientAndBook = async () => {
    const formattedPhone = phone.replace(/\D/g, "");

    const dobObj = new Date(dob + 'T00:00:00');
    const formattedDob = `${(dobObj.getMonth() + 1).toString().padStart(2, '0')}/${dobObj.getDate().toString().padStart(2, '0')}/${dobObj.getFullYear()}`;

    const menstrualObj = new Date(menstrual + 'T00:00:00');
    const formattedMenstrual = `${(menstrualObj.getMonth() + 1).toString().padStart(2, '0')}/${menstrualObj.getDate().toString().padStart(2, '0')}/${menstrualObj.getFullYear()}`;

    try {
      const clientData = {
        firstName,
        lastName,
        email,
        language: language,
        dob: formattedDob,
        menstrual: formattedMenstrual,
        notes,
      };
      await updateClient(formattedPhone, clientData);
  
      console.log("Client updated successfully");
  
      login(formattedPhone, false, true);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s-]*$/.test(value)) {
      setFirstName(value);
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s-]*$/.test(value)) {
      setLastName(value);
    }
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
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

  const validEmail = (str) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(str);
  };  

  const attemptReachStep = async (step) => {
    // 0 = enter phone
    // 1 = continue pregnancy no/unsure/yes => 2/3/4
    // 2 = take client info, update the client object accordingly
    // 3 = looking for proof of positivity yes/no => 4/2
    // 4 = referral phone numbers, update the client object accordingly

    if (step === 1) {
      const formattedPhone = phone.replace(/\D/g, "");
      
      if (formattedPhone.length !== 10) {
        setError("Please enter your 10-digit phone number");
      } else {
        // Check if a client document exists with the given phone number
        const clientDocRef = doc(db, "clients", formattedPhone);
        const clientDoc = await getDoc(clientDocRef);
    
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
    
          // If firstName and lastName are empty, ask them to call
          if (!clientData.firstName || !clientData.lastName) {
            setError("Please call to schedule an appointment.");
          } 
          // If verified is false, ask them to check texts or call for verification
          else if (!clientData.verified) {
            setError("Please check your texts for verification or call for assistance.");
          } 
          // If verified is true, but unableToAct is true, tell them the phone number is restricted
          else if (clientData.verified && clientData.unableToAct) {
            setError("This client's access is restricted.");
          } 
          // If verified is true and unableToAct is false, log them in
          else if (clientData.verified && !clientData.unableToAct) {
            login(formattedPhone, true, false);
          }
        } else {
          // If no client document exists, create a new client
          await createNewClient(formattedPhone);
          login(formattedPhone, false, false);
          setQuestionnaireStep(1);
        }
      }
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
    <div className="w-screen h-screen bg-cover bg-center" style={{ backgroundImage: "url('/StandingDoctor.webp')" }}>
      <div className="flex flex-col md:flex-row items-center justify-start pt-32 md:pt-0 md:justify-center md:gap-16 w-full h-full px-4 py-8 bg-black bg-opacity-50">
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

          {clientType === "" && (<div className="mt-6 flex flex-row justify-center md:justify-start gap-4">
            <JMJButton onClick={() => setClientType("new")} color="green" text="New Client"></JMJButton>
            <JMJButton onClick={() => setClientType("returning")} color="green" text="Returning Client"></JMJButton>
          </div>)}
        </div>

        {/* Right side: Login form (either phone entry or new client questionnaire)*/}
          {clientType !== "" && (<div className="p-6 rounded-lg shadow-lg min-w-[300px] w-full px-4 md:max-w-[600px] md:w-[1/2] bg-JMJ flex flex-col">
            <img
              src="https://jmjpc.org/wp-content/uploads/2023/12/JMJ-Logo-ai.svg"
              alt="JMJ Logo"
              className="mb-2 w-32 h-auto brightness-0 invert mx-auto"
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
              {phone.replace(/\D/g, "").length === 10 && (
                <div className="flex justify-center">
                  <JMJButton onClick={handleLogin} text="Log In" />
                </div>
              )}
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
                    {phone.replace(/\D/g, "").length === 10 && (
                      <div className="flex justify-center">
                        <JMJButton onClick={() => attemptReachStep(1)} text="Continue" />
                      </div>
                    )}
                    {error && <p className="text-red-500 mt-4 text-center font-bold">{error}</p>}
                  </div>
                )}
                {questionnaireStep === 1 && (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-xl text-center font-bold text-white">How can we help you today?</p>
                    <p className="text-md text-center text-white pb-4">Do you intend to continue the pregnancy?</p>
                    <div className="w-[50%] flex flex-col gap-4 justify-center">
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
                      <p className="text-white">Preferred Language (No Creole)</p>
                      <select className="p-2 rounded-lg mb-4 w-full text-start" value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="English">English</option>
                        <option value="Spanish">Español</option>
                      </select>
                      <p className="text-white">Date of Birth</p>
                      <input className="p-2 rounded-lg mb-4 w-full text-center" type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={tenYearsAgoDate}/>
                      <p className="text-white">First Day of Last Menstrual Period</p>
                      <input className="p-2 rounded-lg mb-4 w-full text-center" type="date" value={menstrual} onChange={(e) => setMenstrual(e.target.value)} min={threeMonthsAgoDate} max={new Date().toISOString().split("T")[0]}/>
                      <input className="p-2 rounded-lg w-full text-start" type="" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for Provider (optional)"/>
                    </div>
                    {firstName.length > 0 && lastName.length > 0 && (email === "" || validEmail(email)) && dob !== "" && menstrual !== "" && (
                      <div className="flex justify-center mt-4">
                        <JMJButton onClick={updateClientAndBook} text="Schedule Appointment" />
                      </div>
                    )}
                  </div>
                )}
                {questionnaireStep === 3 && (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-xl text-center font-bold text-white">How can we help you today?</p>
                    <p className="text-md text-center text-white pb-4">Are you looking for a medical proof of positivity for your insurance/Medicaid or help finding a doctor?</p>
                    <div className="w-[50%] flex flex-col gap-4 justify-center">
                      <JMJButton text="Yes" onClick={() => attemptReachStep(4)} color={"white"}></JMJButton>
                      <JMJButton text="No" onClick={() => attemptReachStep(2)} color={"white"}></JMJButton>
                    </div>
                  </div>
                )}
                {questionnaireStep === 4 && (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-xl text-center font-bold text-white">Do you need medical proof of positivity?</p>
                    <p className="text-md text-center text-white pb-4">We can assist you with obtaining a medical proof of positivity document for your insurance/Medicaid and help you find a doctor for prenatal care.</p>
                    <p className="text-md text-center text-white pb-4">For the best service possible, these appointments should be scheduled in advance. WALK-IN APPOINTMENTS ARE BASED ON AVAILABILITY for this type of pregnancy consultation and are not guaranteed same-day. Please call one of the numbers below to schedule your FREE appointment.</p>
                    <p className="text-md text-center text-white pb-4">
                      <span className="font-bold">PLEASE NOTE:</span> We typically do NOT provide an ultrasound as part of these appointments, unless our medical staff deems it necessary.
                    </p>
                    <div className="w-full flex flex-row gap-4 justify-center">
                      <div className="flex flex-col items-center">
                        <JMJButton
                          text="Call Now - Orlando"
                          onClick={() => (window.location.href = "tel:407-839-0620")}
                          color="white"
                        />
                        <p className="text-sm text-white mt-2 text-center">10 AM - 2 PM (M/W/F)</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <JMJButton
                          text="Call Now - Kissimmee"
                          onClick={() => (window.location.href = "tel:407-201-5085")}
                          color="white"
                        />
                        <p className="text-sm text-white mt-2 text-center">10 AM - 2 PM (Tu/Th/Sa)</p>
                      </div>
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
