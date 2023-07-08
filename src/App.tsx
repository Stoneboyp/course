import { useEffect, useState } from "react";
import "./App.scss";
import axios, { AxiosResponse } from "axios";

function App() {
    const [tableData, setTableData] = useState<string[][] | undefined>(
        undefined
    );

    useEffect(() => {
        const fetchDataAndPoll = async () => {
            try {
                const responses: AxiosResponse<any>[] = await Promise.all([
                    fetchData("/first"),
                    fetchData("/second"),
                    fetchData("/third"),
                ]);

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
                        (
                            responses[0].data.rates.RUB /
                            responses[0].data.rates.USD
                        ).toFixed(2),
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
                        (
                            responses[0].data.rates.RUB /
                            responses[0].data.rates.EUR
                        ).toFixed(2),
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
                        (
                            responses[0].data.rates.EUR /
                            responses[0].data.rates.USD
                        ).toFixed(2),
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
            } catch (error) {
                console.log(error);
            }
        };

        fetchDataAndPoll();
    }, []);

    const fetchData = (endpoint: string) => {
        return axios.get(`http://localhost:3000/api/v1${endpoint}`);
    };

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
