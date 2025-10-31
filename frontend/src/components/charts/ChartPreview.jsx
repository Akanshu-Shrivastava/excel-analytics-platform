import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(BarElement,CategoryScale,LinearScale,Title,Tooltip,Legend);

const ChartPreview = ({xAxis,yAxis,data}) => {
    //Extract X and Y Values
    const xValues = data.map((row) => row[xAxis]);
    const yValues = data.map((row) => parseFloat(row[yAxis])); 

    //Chart.js compatible format
    const chartData = {
        labels:xValues,
        datasets:[
            {
                label:`${yAxis} vs ${xAxis}`,
                data: yValues,
                backgroundColor: "rgba(54,162,235,0.6)",
                borderColor:"rgba(54,162,235,1)",
                borderWidth:1,
            },
        ],
    };

    const options = {
        reponsive: true,
        plugins:{
            legend:{
                poition:"top",
            },
            title:{
                display:true,
                text:`${yAxis} vs ${xAxis}`,
            },
        },
    };

    return (
        <div className="mt-6">
            <Bar data={chartData} options = {options} />
        </div>
    );
};

export default ChartPreview;