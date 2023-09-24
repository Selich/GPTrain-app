import { ChakraProvider, Grid, GridItem, Input, Text } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";

const url = "http://127.0.0.1:5000/webcam";
const micUpload = "http://127.0.0.1:5000/mic";
const transcription = "http://127.0.0.1:5000/transcription";
const chatUrl = "http://127.0.0.1:5000/chat";
const paramsUrl = "http://127.0.0.1:5000/params";

function Main() {
  const [recorder, setRecorder] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [chatGpt, setChatGpt] = useState("");
  const [disposition, setDisposition] = useState("0");
  const [product, setProduct] = useState("A BMW Car");
  const [user, setUser] = useState("User is a salesman, selling a product");
  const [age, setAge] = useState("45");
  const [gender, setGender] = useState("male");
  const [location, setLocation] = useState("Munich");
  const [interests, setInterests] = useState("Likes cars.");
  const [initialDisposition, setInitialDisposition] = useState("50");
  const [isInitial, setIsInitial] = useState(true);
  const [emotions, setEmotions] = useState({});

  useEffect(() => {}, [transcription, chatGpt, disposition]);

  let gumStream = null;
  let audioContext = null;

  const transcribe = () => {
    alert("test");
  };

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
  };

  const startRecording = () => {
    let constraints = {
      audio: true,
      video: false,
    };

    audioContext = new window.AudioContext();

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        console.log("initializing Recorder.js ...");

        gumStream = stream;

        let input = audioContext.createMediaStreamSource(stream);

        recorder = new window.Recorder(input, {
          numChannels: 1,
        });

        recorder.record();
        console.log("Recording started");
      })
      .catch(function (err) {
        //enable the record button if getUserMedia() fails
      });
  };

  const getTranscription = async (micUpload, data) => {
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    const res = await axios.post(micUpload, data, config);
    return res.data;
  };

  const onStop = async (blob) => {
    if (isInitial) {
      axios
        .post(paramsUrl, {
          product: product,
          user: user,
          age: age,
          gender: gender,
          location: location,
          interests: interests,
          initialDisposition: initialDisposition,
        })
        .then((res) => {
          setIsInitial(false);
        });
    }
    let data = new FormData();

    data.append("text", "this is the transcription of the audio file");
    data.append("audio", blob, "audio.mp3");

    const temp = await getTranscription(micUpload, data);
    setTranscription(temp);
    const config = {
      headers: { "content-type": "application/json" },
    };
    axios.post(chatUrl, { line: temp }, config).then((res) => {
      setChatGpt(res.data.reply);
      setDisposition(res.data.disposition);
      const synth = window.speechSynthesis;

      const u = new SpeechSynthesisUtterance(res.data.reply);
      synth.speak(u);
    });
  };
  return (
    <ChakraProvider>
      <Grid
        m={2}
        templateAreas={`"header header"
                  "camera main"
                  "form main"`}
        gridTemplateRows={"1fr 1fr 1fr"}
        gridTemplateColumns={"350px 1fr "}
        h="200px"
        gap="1"
        color="blackAlpha.700"
        fontWeight="bold"
      >
        <GridItem pl="2" area={"header"}>
          <Text fontSize="xl">GPTRAINER</Text>
        </GridItem>
        <GridItem pl="10" area={"camera"}>
          <Text mb="8px" fontSize="16px">
            Camera
          </Text>
          <iframe
            title="camera feed"
            allowFullScreen="true"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            width="100%"
            src={url}
            style={{
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;",
            }}
          />
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
          <hr />

          {/* <Flex> */}
          <Text
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
          </Text>
          {/* <Text m={2} fontSize="xl">
            {transcription}
          </Text>
          <Text m={2} fontSize="xl">
            {chatGpt}
          </Text> */}
          {/* </Flex> */}
        </GridItem>
      </Grid>
    </ChakraProvider>
  );
}

export default Main;
