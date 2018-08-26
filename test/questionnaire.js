var Survey = artifacts.require("./Survey.sol");
const config = require("../src/config.js")
const axios = require('axios');

contract("Survey", async (accounts) => {
    let questionnaireKey
    it("should create a new questionnaire", async() => {
        try {
            const instance = await Survey.deployed()
            // Use the first account as questionnaire creator
            const questionnaireCreator = accounts[0]  
            // Set test data
            questionnaireKey = web3.sha3(questionnaireCreator + Date.now()) 
            const questions = [
				{ title: "Cryptos Survey" },
				{
					number: "1",
					question: "Bitcoin above 10000 this year ? ",
					type: "YESNO",
				},
				{
					number: "2",
					question: "Ether drop to 100 this month ? ",
					type: "YESNO",
				},
				{
					number: "3",
					question: "Believe Blockchain ? ",
					type: "YESNO",
				}
            ]
            // Store questions to IPFS
            const result = await axios.post(`${config.IPFS_END_POINT}/json/store`, {
                questions })

            const questionIpfsHash = result.data.hash
            const maxParticipants = 2
            const rewardInEth = 0.1
            // Subscribe to a Solidity event
            let responseQuestionnaireKey        
            instance.LogCreateQuestionnaire({}).watch((error, result) => {
                if (error) {
                    console.log(error);
                }
                // Once the event is triggered, store the result in the external variable
                responseQuestionnaireKey = result.args['key']
            });

            await instance.createQuestionnaire(questionnaireKey, questionIpfsHash
                ,maxParticipants, {from: questionnaireCreator, value: web3.toWei(rewardInEth, 'ether') })
                                                                                 
            const questionnairerObject = await instance.questionnaireStruct.call(questionnaireKey)
            
            // Use assert.equal() to check all the variables
            assert.equal(questionnaireKey, responseQuestionnaireKey, "Questionnaire key was incorrect")
            assert.equal(questionIpfsHash, questionnairerObject[1], "IPFS hash wasn't properly")
            assert.equal(maxParticipants, questionnairerObject[2].toNumber(), "Max participants was incorrect")
        } catch (error) {
            assert.isFalse(error, "Should not be false")         
        }
    }),
    it("should submit a response to the questionnaire", async () => {
        try {
            const instance = await Survey.deployed()
            // Set test data
            const currentParticipants = 2
            const isCompleted = true
            // Submit questionnaire's response accounts
            const responseAccount_1 = accounts[1]
            const responseAccount_2 = accounts[2]
            // Answer questionnaire 
            const answer_1 = ["YES", "YES", "YES"]
            const answer_2 = ["NO", "YES", "NO"]
            // Store answers to IPFS
            const result_1 = await axios.post(`${config.IPFS_END_POINT}/json/store`, {
                answer_1 })
            const result_2 = await axios.post(`${config.IPFS_END_POINT}/json/store`, {
                answer_2 })
            // Save IPFS to Blockchain
            const answerIpfsHash_1 = result_1.data.hash        
            const answerIpfsHash_2 = result_2.data.hash     
            // Submit response to the questionnaire
            await instance.submitResponse(questionnaireKey, answerIpfsHash_1, { from: responseAccount_1 })                    
            await instance.submitResponse(questionnaireKey, answerIpfsHash_2, { from: responseAccount_2 })       
            // Get total responses 
            const responseCount = await instance.getQuestionnairesCount(questionnaireKey)  
            // Get questionnaire
            const questionnaire = await instance.questionnaireStruct(questionnaireKey)
            // Use assert.equal() to check all the variables
            assert.equal(isCompleted, questionnaire[5], "Questionnaire status was incorrect")
            assert.equal(currentParticipants, responseCount.toNumber(), "Questionnaire response count incorrect")
        } catch (error ) {
            assert.isFalse(error, "Should not be false")         
        }
    })
    it("should distribute rewards to the sender", async () => {
        try {
            const instance = await Survey.deployed()   
            // Set test data
            const responseAccount_1 = accounts[1]
            const numberOfRewardClaimed = 1
            // Request reward cliam
            await instance.cliamRewards(questionnaireKey, { from: responseAccount_1 })
            // Get questionnaire
            const questionnaire = await instance.questionnaireStruct(questionnaireKey)
            // Use assert.equal() to check number of reward claimed
            assert.equal(numberOfRewardClaimed, questionnaire[6].toNumber(), "The number of reward cliam was incorrect")       
        } catch (error) {
            assert.isFalse(error, "Should not be false")         
        }
    }),
    it("should show an error when an user submit twice to the same questionnaire", async () => {
        try {
            const instance = await Survey.deployed()
            // Set test data
            const questionnaireCreator = accounts[0]
            const submitResponseAccount = accounts[1]

            const questionnaireKey = web3.sha3(questionnaireCreator + Date.now())
            const questions = [
				{ title: "Cryptos Survey" },
				{
					number: "1",
					question: "Bitcoin above 10000 this year ? ",
					type: "YESNO",
				},
				{
					number: "2",
					question: "Ether drop to 100 this month ? ",
					type: "YESNO",
				},
				{
					number: "3",
					question: "Believe Blockchain ? ",
					type: "YESNO",
				}
            ]
            // Store questions to IPFS
            const result = await axios.post(`${config.IPFS_END_POINT}/json/store`, {
                questions })
            const questionIpfsHash = result.data.hash
            const maxParticipants = 3
            const currentParticipants = 0
            // Answer questionnaire 
            const answer_1 = ["YES", "YES", "YES"]
            const answer_2 = ["NO", "YES", "NO"]
            // Store answers to IPFS
            const result_1 = await axios.post(`${config.IPFS_END_POINT}/json/store`, {
                answer_1 })
            const result_2 = await axios.post(`${config.IPFS_END_POINT}/json/store`, {
                answer_2 })
            // Save IPFS to Blockchain
            const answerIpfsHash_1 = result_1.data.hash        
            const answerIpfsHash_2 = result_2.data.hash     
            const rewardInEth = 0.2
            // Create a questionnaire
            await instance.createQuestionnaire(questionnaireKey, questionIpfsHash 
                ,maxParticipants, currentParticipants, {from: questionnaireCreator, value: web3.toWei(rewardInEth, 'ether') })
            // Use same account to submit two responses
            const submitReponse_1 = await instance.submitResponse(questionnaireKey, answerIpfsHash_1, {from: submitResponseAccount});        
            const submitReponse_2 = await instance.submitResponse(questionnaireKey, answerIpfsHash_2, {from: submitResponseAccount});                    
            
            assert.isFalse(submitReponse_2, "Should be false, as it should throw")            
        } catch(error) {
            assert(true, ' Expected throw an error when an user submit twice')
        }
    }),
    it("should result in error when an user create a questionnaire during the smart contract status is stopped .", async () => {
        try {
            const instance = await Survey.deployed()
            // Stop the existing contract using contract creator
            const contractCreator = accounts[0]
            await instance.toggleContractStopped({from: contractCreator})
            // Use another account to create a questionnaire          
            const questionnaireCreator = accounts[4]  
            // Set test data   
            const questionnaireKey = web3.sha3( questionnaireCreator + Date.now())
            const questions = [
				{ title: "Cryptos Survey" },
				{
					number: "1",
					question: "Bitcoin above 10000 this year ? ",
					type: "YESNO",
				},
				{
					number: "2",
					question: "Ether drop to 100 this month ? ",
					type: "YESNO",
				},
				{
					number: "3",
					question: "Believe Blockchain ? ",
					type: "YESNO",
				}
            ]
            // Store questions to IPFS
            const result = await axios.post(`${config.IPFS_END_POINT}/json/store`, {
                questions })                
            const questionIpfsHash = result.data.hash
            const maxParticipants = 100
            const currentParticipants = 0
            const rewardInEth = 0.2            
            // Create a questionnaire when the contract's status is stopped
            const questionnaire = await instance.createQuestionnaire(questionnaireKey, questionIpfsHash, 
                maxParticipants, currentParticipants, { from: questionnaireCreator, value: web3.toWei(rewardInEth, 'ether') })

            assert.isFalse(questionnaire, "Should be false, as it should throw")                    
        } catch(error) {
            assert(true, 'Expected throw an error when the contract status is stopped')
        }
    }),
    it("should show an error when an user request reward claim to a questionnaire that he/she has not participiated", async () => {
        try {
           const instance = await Survey.deployed()
            // Use non-participating account to claim rewards
           const requestRewardCliamAccount = accounts[4]
           const claimRewardResult = await instance.cliamRewards(questionnaireKey, { from: requestRewardCliamAccount })               
        
           assert.isFalse(claimRewardResult, "Should be false, as it should throw")           
        } catch(error) {
           assert(true, 'Expected throw an error when an user request reward that he/she has not participated.')           
        }
    })
})
