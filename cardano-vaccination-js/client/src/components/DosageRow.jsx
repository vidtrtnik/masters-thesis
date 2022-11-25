export default function DosageRow({ dosage }) {
    return (
        <tr>
            <td>{dosage.id}</td>
            <td>{dosage.name}</td>
            <td>{dosage.company}</td>
            <td><a href={`http://localhost:4000/en/transaction?id=${dosage.code}`}>{dosage.code}</a></td>
            <td>{dosage.dosage}</td>
        </tr>

    )
}