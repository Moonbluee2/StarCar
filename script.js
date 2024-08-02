document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('simulador-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const principalInicial = parseFloat(document.getElementById('principal').value.replace(/,/g, ''));
        const interesAnual = parseFloat(document.getElementById('interes').value);
        const frecuenciaCapitalizacion = parseInt(document.getElementById('capitalizacion').value);
        const periodos = parseInt(document.getElementById('periodos').value);
        const enganche = parseFloat(document.getElementById('enganche').value.replace(/,/g, ''));
        const comision = parseFloat(document.getElementById('comision').value);
        const iva = parseFloat(document.getElementById('iva').value);

        // Validar si los valores son positivos
        if (principalInicial <= 0 || interesAnual <= 0 || frecuenciaCapitalizacion <= 0 || periodos <= 0 || enganche < 0 || comision < 0 || iva < 0) {
            alert('Todos los valores deben ser positivos. Por favor, ingresa números positivos.');
            return;
        }

        const interesAnualDecimal = interesAnual / 100;
        const comisionDecimal = comision / 100;
        const ivaDecimal = iva / 100;

        // Calcular comisión total y monto a financiar
        const comisionTotal = principalInicial * comisionDecimal;
        const montoFinanciar = principalInicial - enganche + comisionTotal;

        // Fórmula del pago mensual usando la fórmula de amortización de un préstamo
        const interesPeriodo = interesAnualDecimal / frecuenciaCapitalizacion;
        const numeroPagos = periodos;
        const pagoMensual = (montoFinanciar * (interesPeriodo * Math.pow(1 + interesPeriodo, numeroPagos))) / (Math.pow(1 + interesPeriodo, numeroPagos) - 1);
        const pagoMensualConIva = pagoMensual * (1 + ivaDecimal);

        let principalActual = montoFinanciar;
        let totalInteres = 0;

        const resultadosTabla = document.getElementById('resultados-tabla').getElementsByTagName('tbody')[0];
        resultadosTabla.innerHTML = '';

        const meses = [];
        const balances = [];
        const principales = [];

        let principalAmortizadoAcumulado = 0;
        let balance = montoFinanciar;

        for (let mes = 1; mes <= periodos; mes++) {
            const interesPeriodoPago = principalActual * (interesAnualDecimal / frecuenciaCapitalizacion);
            const amortizacion = pagoMensualConIva - interesPeriodoPago;
            principalActual -= amortizacion;
            totalInteres += interesPeriodoPago;

            if (principalActual < 0) {
                principalActual = 0;
            }
            balance = principalActual;

            principalAmortizadoAcumulado += amortizacion;

            let row = resultadosTabla.insertRow();
            row.insertCell(0).textContent = mes.toLocaleString();
            row.insertCell(1).textContent = (montoFinanciar - balance + totalInteres).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            row.insertCell(2).textContent = interesPeriodoPago.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            row.insertCell(3).textContent = amortizacion.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            row.insertCell(4).textContent = pagoMensualConIva.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            row.insertCell(5).textContent = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            meses.push(mes);
            balances.push(balance);
            principales.push(principalAmortizadoAcumulado);
        }

        document.getElementById('resumen').innerHTML = `
            <div class="total-pago">
                <h2>Resumen de la Simulación</h2>
                <p>Total de Intereses Pagados: $${totalInteres.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>Balance Final: $${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>Pago Mensual Calculado: $${pagoMensualConIva.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
        `;

        const ctx = document.getElementById('grafica').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [
                    {
                        label: 'Balance Mensual',
                        data: balances,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false
                    },
                    {
                        label: 'Principal Amortizado',
                        data: principales,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        fill: false
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    });
});
