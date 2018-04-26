# Module: MMM-jokes
The `MMM-jokes` módulo es similar al módulo de complementos, pero carga sus datos de una API web para bromas al azar

## Using the module Tesis

Para usar este módulo, agréguelo a la matriz de módulos en `config/config.js` file:
````javascript
modules: [
	{
		module: 'MMM-jokes',
		position: 'lower_third',	// Esta puede ser cualquiera de las regiones.
						// Los mejores resultados en una de las regiones medias como: lower_third
		config: {
		    api: 'icndb' //required
		}
	}
]
````

## Opciones de configuracion

The following properties can be configured:


<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>

	  <tr>
		  <td><code>api</code></td>
		  <td>What API are we going to use?<br>
		 	  <br><b>Possible values:</></b> <code>ticndb</code> (http://www.icndb.com/) ,<code>tambal</code> (http://tambal.azurewebsites.net/)
		 	  <br><b>Default value:</b> <code>ticndb</code>
		  </td>
	  </tr>

		<tr>
			<td><code>updateInterval</code></td>
			<td>How often does the joke have to change? (Milliseconds)<br>
				<br><b>Possible values:</b> <code>1000</code> - <code>86400000</code>
				<br><b>Default value:</b> <code>600000</code> (10 minutes)
			</td>
		</tr>
		<tr>
			<td><code>fadeSpeed</code></td>
			<td>Speed of the update animation. (Milliseconds)<br>
				<br><b>Possible values:</b><code>0</code> - <code>5000</code>
				<br><b>Default value:</b> <code>4000</code> (4 seconds)
			</td>
		</tr>
	</tbody>
</table>
