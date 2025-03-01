import { useParams } from "react-router"

const CharacterDisplay = () => {
    let params = useParams()
    return <>
            <h1>The Id is {params.id}</h1>
    
    </>
}

export default CharacterDisplay