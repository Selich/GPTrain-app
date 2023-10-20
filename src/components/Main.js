import {
  Button,
  ChakraProvider,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

const url = "http://127.0.0.1:5000/webcam";
const micUpload = "http://127.0.0.1:5000/mic";
// const transcription = "http://127.0.0.1:5000/transcription";
const chatUrl = "http://127.0.0.1:5000/chat";
const paramsUrl = "http://127.0.0.1:5000/params";
const emotionUrl = "http://127.0.0.1:5000/emotion";
const apiKeyUrl = "http://127.0.0.1:5000/apikey";
const retryUrl = "http://127.0.0.1:5000/retry";

function Main() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [show, setShow] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [chatGpt, setChatGpt] = useState("");
  const [socialSkills, setSocialSkills] = useState("TBD");
  const [emotion, setEmotion] = useState("TBD");
  const [productKnowledge, setProductKnowledge] = useState("TBD");
  const [product, setProduct] = useState("A BMW Car");
  const [user, setUser] = useState("Salesman, selling a product");
  const [age, setAge] = useState("45");
  const [gender, setGender] = useState("male");
  const [location, setLocation] = useState("Munich");
  const [interests, setInterests] = useState("Likes cars.");
  const [initialDisposition, setInitialDisposition] = useState("50");
  const [disposition, setDisposition] = useState(initialDisposition);
  const [isInitial, setIsInitial] = useState(true);
  const [avgEmotion, setAvgEmotion] = useState("Neutral");
  const [apiKey, setApiKey] = useState('')

  const handleAPIKeyChange = (event) => setApiKey(event.target.value)
  const handleClick = () => setShow(!show);

  // useEffect(() => {
  //   const apiKey = localStorage.getItem('apiKey');
  //   if(apiKey){
  //     setApiKey(apiKey)
  //     submitAPIKey()
  //   } else {
  //     onOpen()
  //   }
  // }, [apiKey, onOpen ])

  useEffect(() => {}, [
    transcription,
    chatGpt,
    disposition,
    initialDisposition,
  ]);

  const getTranscription = async (micUpload, data) => {
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    const res = await axios.post(micUpload, data, config);
    return res.data;
  };

  const retry = () => {
    // set all variables to default
    setTranscription("");
    setChatGpt("");
    setDisposition("0");
    setSocialSkills("TBD");
    setEmotion("TBD");
    setProductKnowledge("TBD");
    setIsInitial(true);
    axios.get(retryUrl).then((res) => {
      console.log("Retry");
    });
  };

  const submitAPIKey = async () => {
    const config = {
      headers: { "content-type": "application/json" },
    };
    axios.post(apiKeyUrl,
      {
        apiKey: apiKey
      },
      config
    ).then((res) => {
      onClose()
    }).catch((err) => {
      alert('Bad API key')
    })
  }

  const onStop = async (blob) => {

    if (!apiKey) {
      onOpen()
      return
    }
    let data = new FormData();

    data.append("text", "this is the transcription of the audio file");
    data.append("audio", blob, "audio.mp3");

    const temp = await getTranscription(micUpload, data);
    setTranscription(temp);
    axios.get(emotionUrl).then((res) => {
      setAvgEmotion(res.data);
    });
    const config = {
      headers: { "content-type": "application/json" },
    };
    axios
      .post(
        chatUrl,
        {
          initial: isInitial,
          product: product,
          user: user,
          age: age,
          gender: gender,
          location: location,
          interests: interests,
          initialDisposition: initialDisposition,
          line: temp,
          emotion: avgEmotion,
        },
        config
      )
      .then((res) => {
        setDisposition(res.data.disposition);
        if (res.data.disposition === "0") {
          setChatGpt(" -- CALL DROPPED -- ");
          return;
        }
        setChatGpt(res.data.reply);
        setEmotion(res.data.emotion);
        setSocialSkills(res.data.socialSkills);
        setProductKnowledge(res.data.productKnowledge);
        setIsInitial(false);

        const synth = window.speechSynthesis;

        const u = new SpeechSynthesisUtterance(res.data.reply);
        synth.speak(u);
      });
  };
  return (
    <ChakraProvider>
      <>
        <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader> OpenAI API Key</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={show ? "text" : "password"}
                  placeholder="Enter API Key"
                  onChange={handleAPIKeyChange}
                  value={apiKey}

                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                colorScheme="blue"
                onClick={submitAPIKey}
              >Submit</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
      <Grid
        m={2}
        templateAreas={`"header header"
                  "camera main"
                  "form main"`}
        gridTemplateRows={"1fr 1fr 1fr"}
        gridTemplateColumns={"333px 1fr "}
        h="200px"
        gap="1"
        color="blackAlpha.700"
        fontWeight="bold"
      >
        <GridItem pl="2" area={"header"}>
          <Text fontSize="xl">
            GPTRAINER

            <Button style={{ float: "right" }} onClick={onOpen}>
              {apiKey ? 'Key Added' : 'Add OpenAI API key'} </Button>
          </Text>
        </GridItem>
        <GridItem pl="10" area={"camera"}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              height: "100%",
              paddingTop: "56.25%", // 16:9 Aspect Ratio. Adjust as needed.
            }}
          >
            <iframe
              title="camera feed"
              allowFullScreen={true}
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              src={url}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                transform: "scale(1.2)", // Scale down to 80% of original size
                transformOrigin: "top left", // Set scaling origin to top left corner
              }}
            />
          </div>
        </GridItem>
        <GridItem pl="2" area={"form"}>
          <Text mb="8px">Product Details</Text>
          <Input
            mb={2}
            placeholder="Product"
            onChange={(e) => setProduct(e.target.value)}
            value={product}
          />
          <Text mb="8px">User Details</Text>
          <Input
            mb={2}
            placeholder="User"
            onChange={(e) => setUser(e.target.value)}
            value={user}
          />
          <Text mb="8px">Customer Details</Text>
          <Text mb="8px" fontSize="12px">
            Age
          </Text>
          <Input
            mb={2}
            placeholder="Age"
            onChange={(e) => setAge(e.target.value)}
            value={age}
          />
          <Text mb="8px" fontSize="12px">
            Gender
          </Text>
          <Input
            mb={2}
            placeholder="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
          <Text mb="8px" fontSize="12px">
            Location
          </Text>
          <Input
            mb={2}
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Text mb="8px" fontSize="12px">
            Interests
          </Text>
          <Input
            mb={2}
            placeholder="Interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
          <Text mb="8px" fontSize="12px">
            Initial Disposition
          </Text>
          <Input
            mb={2}
            placeholder="Initial Disposition"
            value={initialDisposition}
            onChange={(e) => setInitialDisposition(e.target.value)}
          />
          <AudioRecorder
            width={250}
            onRecordingComplete={onStop}
            audioTrackConstraints={{
              noiseSuppression: true,
              echoCancellation: true,
            }}
            downloadFileExtension="mp3"
          />
        </GridItem>
        <GridItem
          pl="3"
          ml={2}
          mr={2}
          pr="3"
          bg="white"
          area={"main"}
          boxShadow={
            "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;"
          }
        >
          <Text m={2} fontSize="xl">
            Disposition: {disposition}
          </Text>
          <Text m={2} fontSize="xl">
            Emotion: {emotion}
          </Text>
          <Text m={2} fontSize="xl">
            Social Skills: {socialSkills}
          </Text>
          <Text m={2} fontSize="xl">
            Product Knowledge: {productKnowledge}
          </Text>
          <hr />

          {/* <Flex> */}
          {/* <Text
            m={2}
            width="30%"
            fontSize="md"
            bg={"rgb(0, 120, 254)"}
            borderRadius={8}
            p={3}
            color={"white"}
            boxShadow={"-2px 2px 2px 0 rgba( 178, 178, 178, .4 )"}
          >
            Are you interested in buying a car?
          </Text>
          <Text
            m={2}
            fontSize="md"
            width="30%"
            bg={"#d8d8d8"}
            borderRadius={8}
            p={3}
            color={"black"}
            boxShadow={"-2px 2px 2px 0 rgba( 178, 178, 178, .4 )"}
          >
            What type of car are you offering?
          </Text> */}
          <Text m={2} fontSize="xl">
            {transcription}
          </Text>
          <Text m={2} fontSize="xl">
            {chatGpt}
          </Text>
          <Button hidden={disposition !== "0" || !isInitial} onClick={retry}>
            Retry
          </Button>
        </GridItem>
      </Grid>
    </ChakraProvider>
  );
}

export default Main;
