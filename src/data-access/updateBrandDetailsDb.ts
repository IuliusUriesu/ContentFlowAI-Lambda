import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getAppDataTableName } from "../utils/utils";
import ddbDocClient from "./ddbDocClient";

const updateBrandDetailsDb = async (
    userId: string,
    fullName: string,
    brandThemes: string,
    toneOfVoice: string,
    targetAudience: string,
    contentGoals: string,
) => {
    const tableName = getAppDataTableName();

    const command = new UpdateCommand({
        TableName: tableName,
        Key: {
            PK: `u#${userId}`,
            SK: "profile",
        },
        UpdateExpression:
            "SET fullName = :fullName, \
            brandThemes = :brandThemes, \
            toneOfVoice = :toneOfVoice, \
            targetAudience = :targetAudience, \
            contentGoals = :contentGoals",
        ExpressionAttributeValues: {
            ":fullName": fullName,
            ":brandThemes": brandThemes,
            ":toneOfVoice": toneOfVoice,
            ":targetAudience": targetAudience,
            ":contentGoals": contentGoals,
        },
        ReturnValues: "ALL_NEW",
    });

    const response = await ddbDocClient.send(command);
    return response.Attributes;
};

export default updateBrandDetailsDb;
