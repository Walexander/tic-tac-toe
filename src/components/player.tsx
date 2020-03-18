import { h, Component } from 'preact'
import { OwnerType } from '../game/marker'

interface Props {
	active: OwnerType,
}
const playerList = [ OwnerType.PLAYER_1, OwnerType.PLAYER_2 ]

export class Player extends Component<Props> {
	render({ active }: Props) {
		return(
			<ul class="players">
			{
				playerList.map(player => {
					let classes = [
						'players__player',
						'--' + (active == player ? 'active' : 'inactive'),
					].join(' ')
					return (<li className={classes}>{player}</li>)
				})
			}
			{this.props.children}
			</ul>
		)
	}
}
