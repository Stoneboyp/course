import { useEffect, useState } from "react";
import "./App.scss";
import axios, { AxiosResponse } from "axios";

type responseType = {
    rates: {
        RUB: number;
        USD: number;
        EUR: number;
    };
    timestamp: number;
    base: string;
    date: string;
};

function App() {
    const [tableData, setTableData] = useState<string[][]>();

    const fetchData = (endpoint: string) => {
        return axios.get(`http://localhost:3000/api/v1${endpoint}`);
    };

    const pollData = async (pollEndpoint: string) => {
        if (!tableData) {
            return;
        }

        try {
            // TODO: replace with fetchData
            const response = await axios.get(
                `http://localhost:3000/api/v1${pollEndpoint}`
            );

            let indexToUpdate: number;
            if (pollEndpoint === "/first/poll") {
                indexToUpdate = 1;
            } else if (pollEndpoint === "/second/poll") {
                indexToUpdate = 2;
            } else if (pollEndpoint === "/third/poll") {
                indexToUpdate = 3;
            }

            const newData = tableData.map((item: any, index) => {
                if (index === 0) {
                    return item;
                }

                if (!item[0].includes(response.data.base)) {
                    return item;
                }

                const currency = item[0].split("/")[0];
                const newRate = response.data.rates[currency].toFixed(2);

                if (newRate) {
                    const newItem = [...item];
                    newItem[indexToUpdate] = String(newRate);
                    return newItem;
                }

                return item;
            });

            setTableData(newData);

            if (response) {
                await pollData(pollEndpoint);
            }
        } catch (error) {
            console.log("Polling error:", error);
        }
    };

    useEffect(() => {
        const fetchDataAndPoll = async () => {
            try {
                const responses: AxiosResponse<responseType>[] =
                    await Promise.all([
                        fetchData("/first"),
                        fetchData("/second"),
                        fetchData("/third"),
                    ]);

                const rubToUsd = (
                    responses[0].data.rates.RUB / responses[0].data.rates.USD
                ).toFixed(2);
                const rubToEur = (
                    responses[0].data.rates.RUB / responses[0].data.rates.EUR
                ).toFixed(2);
                const eurToUsd = (
                    responses[0].data.rates.EUR / responses[0].data.rates.USD
                ).toFixed(2);
                let updatedTableData: string[][] = [
                    ["Pair Name / Market", "First", "Second", "Third"],
                    [
                        `RUB/${responses[0].data.base}`,
                        responses[0].data.rates.RUB.toFixed(2),
                        responses[1].data.rates.RUB.toFixed(2),
                        responses[2].data.rates.RUB.toFixed(2),
                    ],
                    [
                        `USD/${responses[0].data.base}`,
                        responses[0].data.rates.USD.toFixed(2),
                        responses[1].data.rates.USD.toFixed(2),
                        responses[2].data.rates.USD.toFixed(2),
                    ],
                    [
                        `EUR/${responses[0].data.base}`,
                        responses[0].data.rates.EUR.toFixed(2),
                        responses[1].data.rates.EUR.toFixed(2),
                        responses[2].data.rates.EUR.toFixed(2),
                    ],
                    [
                        "RUB/USD",
                        rubToUsd,
                        (
                            responses[1].data.rates.RUB /
                            responses[1].data.rates.USD
                        ).toFixed(2),
                        (
                            responses[2].data.rates.RUB /
                            responses[2].data.rates.USD
                        ).toFixed(2),
                    ],
                    [
                        "RUB/EUR",
                        rubToEur,
                        (
                            responses[1].data.rates.RUB /
                            responses[1].data.rates.EUR
                        ).toFixed(2),
                        (
                            responses[2].data.rates.RUB /
                            responses[2].data.rates.EUR
                        ).toFixed(2),
                    ],
                    [
                        "EUR/USD",
                        eurToUsd,
                        (
                            responses[1].data.rates.EUR /
                            responses[1].data.rates.USD
                        ).toFixed(2),
                        (
                            responses[2].data.rates.EUR /
                            responses[2].data.rates.USD
                        ).toFixed(2),
                    ],
                ];

                setTableData(updatedTableData);

                setTimeout(() => {
                    pollData("/first/poll");
                    pollData("/second/poll");
                    pollData("/third/poll");
                }, 2000);
            } catch (error) {
                console.log(error);
            }
        };

        fetchDataAndPoll();
    }, []);

    return (
        <>
            {tableData ? (
                <table className="table">
                    <thead>
                        <tr>
                            {tableData[0].map((cellData, index) => (
                                <th key={index}>{cellData}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.slice(1).map((rowData, index) => {
                            const minValue = Math.min(
                                ...rowData.slice(1).map(Number)
                            );
                            return (
                                <tr key={index}>
                                    {rowData.map((cellData, index) => {
                                        const isMin =
                                            cellData === String(minValue);
                                        return (
                                            <td
                                                className={
                                                    isMin ? "lowest" : ""
                                                }
                                                key={index}
                                            >
                                                {cellData}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : null}
        </>
    );
}

export default App;
